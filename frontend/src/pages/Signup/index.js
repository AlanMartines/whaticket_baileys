import React, { useState, useEffect } from "react";
import qs from 'query-string'

import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import usePlans from "../../hooks/usePlans";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import {
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	InputAdornment,
	IconButton,
} from "@material-ui/core";
import { LockOutlined, Visibility, VisibilityOff } from '@material-ui/icons';
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import { i18n } from "../../translate/i18n";

import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import moment from "moment";
import InputMask from 'react-input-mask';

const copyright = process.env.REACT_APP_COPYRIGHT || "";
const copyrightYear = process.env.REACT_APP_COPYRIGHT_YEAR || "0000";
const copyrightUrl = process.env.REACT_APP_COPYRIGHT_URL || "";
const trialExpiration = process.env.REACT_APP_TRIALEXPIRATION || 5;
const planIdDefault = process.env.REACT_APP_PLANIDDEFAULT || "";

const Copyright = () => {
	return (
		<Typography variant="body2" color="textSecondary" align="center">
			{"Copyright © "}
			{copyrightYear}
			{"-"}
			{new Date().getFullYear()}
			{" - "}
			<Link color="inherit" href={copyrightUrl}>
				{copyright}
			</Link>
			{"."}
		</Typography>
	);
};

const useStyles = makeStyles(theme => ({
	paper: {
		marginTop: theme.spacing(8),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%",
		marginTop: theme.spacing(3),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(3, i18n.t("signup.validate.name.min"))
		.max(50, i18n.t("signup.validate.name.max"))
		.required(i18n.t("signup.validate.name.required")),
	phone: Yup.string()
		.required(i18n.t("signup.validate.phone.required")),
	email: Yup.string()
		.email(i18n.t("signup.validate.email.email"))
		.required(i18n.t("signup.validate.email.required")),
	password: Yup.string()
		.min(5, i18n.t("signup.validate.password.min"))
		.max(50, i18n.t("signup.validate.password.max"))
		.required(i18n.t("signup.validate.password.required")),
	confirmPassword: Yup.string()
		.required(i18n.t("signup.validate.password.confirmPassword"))
		.oneOf([Yup.ref('password'), null], i18n.t("signup.validate.password.oneOf")),
	planId: Yup.string()
		.required(i18n.t("signup.validate.planId.required")),
	acceptTerms: Yup.bool()
		.oneOf([true], i18n.t("signup.validate.acceptTerms.required")),
});

const SignUp = () => {
	const classes = useStyles();
	const history = useHistory();
	let companyId = null

	const params = qs.parse(window.location.search)
	if (params.companyId !== undefined) {
		companyId = params.companyId
	}

	const initialState = { name: "", phone: "", email: "", password: "", confirmPassword: "", planId: planIdDefault, };

	const [user] = useState(initialState);
	// Estado para a senha principal
	const [showPassword, setShowPassword] = useState(false);
	// Estado para a confirmação de senha
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const dueDate = moment().add(trialExpiration, "day").format();
	const handleSignUp = async values => {
		Object.assign(values, { recurrence: "MENSAL" });
		Object.assign(values, { dueDate: dueDate });
		Object.assign(values, { status: "t" });
		Object.assign(values, { campaignsEnabled: true });
		Object.assign(values, { onlyAPI: false });
		try {
			await openApi.post("/companies/cadastro", values);
			toast.success(i18n.t("signup.toasts.success"));
			history.push("/login");
		} catch (err) {
			console.log(err);
			toastError(err);
		}
	};

	const [plans, setPlans] = useState([]);
	const { list: listPlans } = usePlans();

	useEffect(() => {
		async function fetchData() {
			const list = await listPlans();
			setPlans(list);
		}
		fetchData();
	}, []);


	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<LockOutlinedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					{i18n.t("signup.title")}
				</Typography>
				{/* <form className={classes.form} noValidate onSubmit={handleSignUp}> */}
				<Formik
					initialValues={user}
					enableReinitialize={true}
					validationSchema={UserSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSignUp(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting }) => (
						<Form className={classes.form}>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<Field
										as={TextField}
										autoComplete="name"
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										fullWidth
										id="name"
										label="Nome da Empresa"
									/* required */
									/>
								</Grid>
								<Grid item xs={12}>
									<Field
										as={TextField}
										name="phone"
										error={touched.phone && Boolean(errors.phone)}
										helperText={touched.phone && errors.phone}
										variant="outlined"
										fullWidth
										id="phone"
										label="Telefone com DDI"
										/* required */
									/>
              	</Grid>
								<Grid item xs={12}>
									<Field
										as={TextField}
										variant="outlined"
										fullWidth
										id="email"
										label={i18n.t("signup.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										autoComplete="email"
									/* required */
									/>
								</Grid>

								<Grid item xs={12}>
									<Field
										as={TextField}
										variant="outlined"
										fullWidth
										name="password"
										error={touched.password && Boolean(errors.password)}
										helperText={touched.password && errors.password}
										label={i18n.t("signup.form.password")}
										type={showPassword ? 'text' : 'password'}
										id="password"
										autoComplete="current-password"
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														aria-label="toggle password visibility"
														onClick={() => setShowPassword((prev) => !prev)}
													>
														{showPassword ? <VisibilityOff /> : <Visibility />}
													</IconButton>
												</InputAdornment>
											),
										}}
									/* required */
									/>
								</Grid>

								<Grid item xs={12}>
									<Field
										as={TextField}
										variant="outlined"
										fullWidth
										name="confirmPassword"
										error={touched.confirmPassword && Boolean(errors.confirmPassword)}
										helperText={touched.confirmPassword && errors.confirmPassword}
										label={i18n.t("signup.form.confirmPassword")}
										type={showConfirmPassword ? 'text' : 'password'}
										id="confirmPassword"
										autoComplete="current-password"
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														aria-label="toggle confirmPassword visibility"
														onClick={() => setShowConfirmPassword((prev) => !prev)}
													>
														{showConfirmPassword ? <VisibilityOff /> : <Visibility />}
													</IconButton>
												</InputAdornment>
											),
										}}
									/* required */
									/>
								</Grid>

								<Grid item xs={12}>
									<InputLabel htmlFor="plan-selection">Plano</InputLabel>
									<Field
										as={Select}
										variant="outlined"
										fullWidth
										id="plan-selection"
										label="Plano"
										name="planId"
										defaultValue={planIdDefault}
									/* required */
									>
										{plans.map((plan, key) => (
											<MenuItem key={key} value={plan.id}>
												{plan.name} - Atendentes: {plan.users} - WhatsApp: {plan.connections} - Filas: {plan.queues} - R$ {plan.value}
											</MenuItem>
										))}
									</Field>
								</Grid>
							</Grid>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								color="primary"
								className={classes.submit}
							>
								{i18n.t("signup.buttons.submit")}
							</Button>
							
							<Grid container justify="flex-end">
								<Grid item>
									<Link
										href="#"
										variant="body2"
										component={RouterLink}
										to="/login"
									>
										{i18n.t("signup.buttons.login")}
									</Link>
								</Grid>
							</Grid>
						</Form>
					)}
				</Formik>
			</div>
			<Box mt={5}>{<Copyright />}</Box>
		</Container>
	);
};

export default SignUp;
