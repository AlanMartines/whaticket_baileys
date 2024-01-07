import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import { LockOutlined, Visibility, VisibilityOff } from '@material-ui/icons';
import * as Yup from "yup";

import { i18n } from "../../translate/i18n";

import { AuthContext } from "../../context/Auth/AuthContext";
import logoDefault from "../../assets/logoLoginOption.png";
const logo = process.env.REACT_APP_LOGO || logoDefault;

const copyright = process.env.REACT_APP_COPYRIGHT || "";
const copyrightYear = process.env.REACT_APP_COPYRIGHT_YEAR || "0000";
const copyrightUrl = process.env.REACT_APP_COPYRIGHT_URL || "";

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
		width: "100%", // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));

const UserSchema = Yup.object().shape({
	email: Yup.string()
		.email(i18n.t("signup.validate.email.email"))
		.required(i18n.t("signup.validate.email.required")),
	password: Yup.string()
		.min(5, i18n.t("signup.validate.password.min"))
		.max(50, i18n.t("signup.validate.password.max"))
		.required(i18n.t("signup.validate.password.required")),
});

const Login = () => {
	const classes = useStyles();

	const initialState = { email: "", password: "" };

	const [user, setUser] = useState(initialState);
	const [showPassword, setShowPassword] = useState(false);
	const { handleLogin } = useContext(AuthContext);

	const handleChangeInput = e => {
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	const handlSubmit = e => {
		e.preventDefault();
		handleLogin(user);
	};

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<div>
					<img style={{ margin: "0 auto", height: "120px", width: "100%" }} src={logo} alt="Whats" />
				</div>
				{ <Typography component="h1" variant="h5">
					{i18n.t("login.title")}
				</Typography> }
				<form className={classes.form} onSubmit={handlSubmit}>
					<TextField
						variant="outlined"
						margin="normal"
						/* required */
						fullWidth
						id="email"
						label={i18n.t("login.form.email")}
						name="email"
						value={user.email}
						onChange={handleChangeInput}
						autoComplete="email"
						autoFocus
					/>
					<TextField
						variant="outlined"
						margin="normal"
						/* required */
						fullWidth
						name="password"
						label={i18n.t("login.form.password")}
						type={showPassword ? 'text' : 'password'}
						id="password"
						value={user.password}
						onChange={handleChangeInput}
						autoComplete="current-password"
						InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((e) => !e)}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
					/>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						className={classes.submit}
					>
						{i18n.t("login.buttons.submit")}
					</Button>
					{ /*
					<Grid container>
						<Grid item>
							<Link
								href="#"
								variant="body2"
								component={RouterLink}
								to="/signup"
							>
								{i18n.t("login.buttons.register")}
							</Link>
						</Grid>
					</Grid>
					*/ }
				</form>
			</div>
			<Box mt={8}>{ <Copyright /> }</Box>
		</Container>
	);
};

export default Login;
