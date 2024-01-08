import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import useAuth from "../../hooks/useAuth.js";

import {
	Dialog,
	DialogContent,
	DialogTitle,
	Button,
	DialogActions,
	CircularProgress,
	TextField,
	Switch,
	FormControlLabel,
	Grid,
	Typography,
} from "@material-ui/core";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},

	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
	},

	btnWrapper: {
		position: "relative",
	},

	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
}));

const SessionSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
});

const handleGerarChaveAlfanumerica = (tamanho) => {
	const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let resultado = '';

	for (let i = 0; i < tamanho; i++) {
		const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
		resultado += caracteres.charAt(indiceAleatorio);
	}

	return resultado;
}

const GroupsModal = ({ open, onClose, whatsAppId }) => {
	const classes = useStyles();
	const history = useHistory();
	const initialState = {
		name: "",
		greetingMessage: "",
		complationMessage: "",
		outOfHoursMessage: "",
		ratingMessage: "",
		isDefault: false,
		token: handleGerarChaveAlfanumerica(20),
		provider: "beta",
		useNPS: false,
		expiresTicketNPS: 3,
		expiresTicket: 0,
		webhook_cli: "",
		wh_message: true,
		wh_qrcode: true,
		wh_connect: true,
		wh_status: true
	};
	const [whatsApp, setWhatsApp] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [currentUser, setCurrentUser] = useState({});

	const { getCurrentUserInfo } = useAuth();

	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;

			const user = await getCurrentUserInfo();
			setCurrentUser(user);
			const isSuper = user.super;

			try {
				const { data } = await api.get(`/whatsapp/${whatsAppId}?session=0`);
				setWhatsApp(data);

				const whatsQueueIds = data.queues?.map((queue) => queue.id);
				setSelectedQueueIds(whatsQueueIds);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, [whatsAppId]);

	const handleSaveWhatsApp = async (values) => {
		const whatsappData = { ...values, queueIds: selectedQueueIds };
		delete whatsappData["queues"];
		delete whatsappData["session"];

		try {
			if (whatsAppId) {
				await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
			} else {
				await api.post("/whatsapp", whatsappData);
			}
			toast.success(i18n.t("GroupsModal.success"));
			handleClose();
		} catch (err) {
			toastError(err);
		}
	};

	const handleClose = () => {
		onClose();
		//history.push("/connections");
		setWhatsApp(initialState);
	};

  const isSuper = () => {
    return currentUser.super;
  };

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="sm"
				fullWidth
				scroll="paper"
			>
				<DialogTitle>
					{whatsAppId ? i18n.t("GroupsModal.title.edit") : i18n.t("GroupsModal.title.add")}
				</DialogTitle>
				<Formik
					initialValues={whatsApp}
					enableReinitialize={true}
					validationSchema={SessionSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveWhatsApp(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, touched, errors, isSubmitting }) => (
						<Form>
							<DialogContent dividers>
								<div className={classes.multFieldLine}>
									<Grid spacing={2} container>
										<Grid item>
											<Field
												as={TextField}
												label={i18n.t("GroupsModal.form.name")}
												autoFocus
												name="name"
												error={touched.name && Boolean(errors.name)}
												helperText={touched.name && errors.name}
												variant="outlined"
												margin="dense"
												className={classes.textField}
											/>

										</Grid>
										<Grid item>
											<FormControlLabel
												control={
													<Field
														as={Switch}
														color="primary"
														name="isDefault"
														checked={values.isDefault}
													/>
												}
												label={i18n.t("GroupsModal.form.default")}
											/>
										</Grid>

										<Grid item>
											<Field
												as={TextField}
												label={'Encerrar chat após x horas'}
												name="expiresTicket"
												error={touched.expiresTicket && Boolean(errors.expiresTicket)}
												helperText={touched.expiresTicket && errors.expiresTicket}
												variant="outlined"
												margin="dense"
												className={classes.textFieldTime}
											/>

										</Grid>
									</Grid>
								</div>
								<div>
									<Grid item>
										<Field
											as={TextField}
											label={i18n.t("GroupsModal.form.webhook_cli")}
											autoFocus
											name="webhook_cli"
											fullWidth
											error={touched.webhook_cli && Boolean(errors.webhook_cli)}
											helperText={touched.webhook_cli && errors.webhook_cli}
											variant="outlined"
											margin="dense"
											className={classes.textField}
										/>

									</Grid>
								</div>
								<div>
									<Typography color="primary" className={classes.elementMargin}>
										{i18n.t("GroupsModal.form.wh_info")}
									</Typography>
								</div>
								<div className={classes.multFieldLine}>
									<Grid item>
										<FormControlLabel
											control={
												<Field
													as={Switch}
													color="primary"
													name="wh_message"
													checked={values.wh_message}
												/>
											}
											label={i18n.t("GroupsModal.form.wh_message")}
										/>
									</Grid>

									<Grid item>
										<FormControlLabel
											control={
												<Field
													as={Switch}
													color="primary"
													name="wh_qrcode"
													checked={values.wh_qrcode}
												/>
											}
											label={i18n.t("GroupsModal.form.wh_qrcode")}
										/>
									</Grid>

									<Grid item>
										<FormControlLabel
											control={
												<Field
													as={Switch}
													color="primary"
													name="wh_connect"
													checked={values.wh_connect}
												/>
											}
											label={i18n.t("GroupsModal.form.wh_connect")}
										/>
									</Grid>

									<Grid item>
										<FormControlLabel
											control={
												<Field
													as={Switch}
													color="primary"
													name="wh_status"
													checked={values.wh_status}
												/>
											}
											label={i18n.t("GroupsModal.form.wh_status")}
										/>
									</Grid>
								</div>
								<div>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.greetingMessage")}
										type="greetingMessage"
										multiline
										rows={4}
										fullWidth
										name="greetingMessage"
										error={
											touched.greetingMessage && Boolean(errors.greetingMessage)
										}
										helperText={
											touched.greetingMessage && errors.greetingMessage
										}
										variant="outlined"
										margin="dense"
									/>
								</div>
								<div>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.complationMessage")}
										type="complationMessage"
										multiline
										rows={4}
										fullWidth
										name="complationMessage"
										error={
											touched.complationMessage &&
											Boolean(errors.complationMessage)
										}
										helperText={
											touched.complationMessage && errors.complationMessage
										}
										variant="outlined"
										margin="dense"
									/>
								</div>
								<div>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.outOfHoursMessage")}
										type="outOfHoursMessage"
										multiline
										rows={4}
										fullWidth
										name="outOfHoursMessage"
										error={
											touched.outOfHoursMessage &&
											Boolean(errors.outOfHoursMessage)
										}
										helperText={
											touched.outOfHoursMessage && errors.outOfHoursMessage
										}
										variant="outlined"
										margin="dense"
									/>
								</div>
								<div>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.ratingMessage")}
										type="ratingMessage"
										multiline
										rows={4}
										fullWidth
										name="ratingMessage"
										error={
											touched.ratingMessage && Boolean(errors.ratingMessage)
										}
										helperText={touched.ratingMessage && errors.ratingMessage}
										variant="outlined"
										margin="dense"
									/>
								</div>
								<div>
									<Field
										as={TextField}
										label={i18n.t("GroupsModal.form.token")}
										fullWidth
										name="token"
										variant="outlined"
										margin="dense"
										className={classes.textField}
										InputProps={{	/* readOnly: isSuper() ? false : true, */ }}
										style={{ /* backgroundColor: isSuper() ? "#FFFFFF" : "#A9A9A9", */ }}
									/>
								</div>
								<QueueSelect
									selectedQueueIds={selectedQueueIds}
									onChange={(selectedIds) => setSelectedQueueIds(selectedIds)}
								/>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("GroupsModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{whatsAppId ? i18n.t("GroupsModal.buttons.okEdit") : i18n.t("GroupsModal.buttons.okAdd")}
									{isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									)}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default React.memo(GroupsModal);
