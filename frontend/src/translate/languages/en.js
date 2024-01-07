const messages = {
	en: {
		translations: {
			signup: {
				title: "Sign up",
				toasts: {
					success: "User created successfully! Please login!",
					fail: "Error creating user. Check the reported data.",
				},
				form: {
					company: "Company Name",
					name: "Name",
					email: "Email",
					password: "Password",
					confirmPassword: "Confirm Password",
				},
				buttons: {
					submit: "Register",
					login: "Already have an account? Log in!",
				},
				validate: {
					name: {
						required: "Please provide a name",
						min: "Please provide a longer name",
						max: "Please provide a shorter name",
					},
					phone: {
						required: "Please provide the phone number",
					},
					email: {
						required: "Please provide an email",
						email: "Please provide a valid email",
						test: "El correo electrónico ya está en uso",
					},
					password: {
						required: "Please provide a password",
						min: "Please provide a longer password",
						max: "Please provide a shorter password",
						confirmPassword: "Confirm Password is required",
						oneOf: "Confirm Password does not match",
					},
					planId: {
						required: "Please select a plan",
					},
					acceptTerms: {
						required: "Accept Terms is required",
					},
				},
			},
			login: {
				title: "Login",
				form: {
					email: "Email",
					password: "Password",
				},
				buttons: {
					submit: "Enter",
					register: "Don't have an account? Register!",
				},
			},
			auth: {
				toasts: {
					success: "Login successfully!",
				},
			},
			dashboard: {
				charts: {
					perDay: {
						title: "Tickets today: ",
					},
				},
			},
			connections: {
				title: "Connections",
				add: "Add Connection",
				toasts: {
					deleted: "WhatsApp connection deleted sucessfully!",
				},
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage: "Are you sure? It cannot be reverted.",
					disconnectTitle: "Disconnect",
					disconnectMessage: "Are you sure? You'll need to read QR Code again.",
				},
				buttons: {
					add: "Add WhatsApp",
					disconnect: "Disconnect",
					tryAgain: "Try Again",
					qrcode: "QR CODE",
					newQr: "New QR CODE",
					connecting: "Connectiing",
				},
				toolTips: {
					disconnected: {
						title: "Failed to start WhatsApp session",
						content: "Make sure your cell phone is connected to the internet and try again, or request a new QR Code",
					},
					qrcode: {
						title: "Waiting for QR Code read",
						content: "Click on 'QR CODE' button and read the QR Code with your cell phone to start session",
					},
					connected: {
						title: "Connection established",
					},
					timeout: {
						title: "Connection with cell phone has been lost",
						content: "Make sure your cell phone is connected to the internet and WhatsApp is open, or click on 'Disconnect' button to get a new QRcode",
					},
				},
				table: {
					company: "Company",
					channel: "Channel",
					name: "Name",
					status: "Status",
					lastUpdate: "Last Update",
					default: "Default",
					actions: "Actions",
					session: "Session",
					duedate: "Due Date",
				},
			},
			whatsappModal: {
				title: {
					add: "Add WhatsApp",
					edit: "Edit WhatsApp",
				},
				form: {
					name: "Name",
					default: "Default",
					sendmass: "Mass mailing",
					webhook_cli: "Webhook",
					wh_message: "Menssage",
					wh_qrcode: "QRCode",
					wh_connect: "Connect",
					wh_status: "Status",
					wh_info: "Note: Mark the event(s) you wish to receive a POST type request",
					whatsnotify: "Notification WhatsApp + DDI",
					token: "Token",
				},
				buttons: {
					okAdd: "Add",
					okEdit: "Save",
					cancel: "Cancel",
				},
				success: "WhatsApp saved successfully.",
			},
			qrCode: {
				message: "Read QrCode to start the session",
			},
			contacts: {
				title: "Contacts",
				toasts: {
					deleted: "Contact deleted sucessfully!",
				},
				searchPlaceholder: "Search ...",
				confirmationModal: {
					deleteTitle: "Delete",
					importTitlte: "Import contacts",
					deleteMessage: "Are you sure you want to delete this contact? All related tickets will be lost.",
					importMessage: "Do you want to import all contacts from the phone?",
				},
				buttons: {
					import: "Import Contacts",
					add: "Add Contact",
				},
				table: {
					name: "Name",
					whatsapp: "WhatsApp",
					email: "Email",
					actions: "Actions",
				},
			},
			contactModal: {
				title: {
					add: "Add contact",
					edit: "Edit contact",
				},
				form: {
					mainInfo: "Contact details",
					extraInfo: "Additional information",
					name: "Name",
					number: "Whatsapp number",
					email: "Email",
					extraName: "Field name",
					extraValue: "Value",
				},
				buttons: {
					addExtraInfo: "Add information",
					okAdd: "Add",
					okEdit: "Save",
					cancel: "Cancel",
				},
				success: "Contact saved successfully.",
			},
			queueModal: {
				title: {
					add: "Add queue",
					edit: "Edit queue",
				},
				form: {
					name: "Name",
					color: "Color",
					greetingMessage: "Greeting Message",
				},
				buttons: {
					okAdd: "Add",
					okEdit: "Save",
					cancel: "Cancel",
				},
			},
			userModal: {
				title: {
					add: "Add user",
					edit: "Edit user",
				},
				form: {
					name: "Name",
					email: "Email",
					password: "Password",
					profile: "Profile",
				},
				buttons: {
					okAdd: "Add",
					okEdit: "Save",
					cancel: "Cancel",
				},
				success: "User saved successfully.",
			},
			chat: {
				noTicketMessage: "Select a ticket to start chatting.",
			},
			ticketsManager: {
				buttons: {
					newTicket: "New",
				},
			},
			ticketsQueueSelect: {
				placeholder: "Queues",
			},
			tickets: {
				toasts: {
					deleted: "The ticket you were on has been deleted.",
				},
				notification: {
					message: "Message from",
				},
				tabs: {
					open: { title: "Inbox" },
					closed: { title: "Resolved" },
					search: { title: "Search" },
				},
				search: {
					placeholder: "Search tickets and messages.",
				},
				buttons: {
					showAll: "All",
				},
			},
			transferTicketModal: {
				title: "Transfer Ticket",
				fieldLabel: "Type to search for users",
				noOptions: "No user found with this name",
				buttons: {
					ok: "Transfer",
					cancel: "Cancel",
				},
			},
			ticketsList: {
				pendingHeader: "Queue",
				assignedHeader: "Working on",
				noTicketsTitle: "Nothing here!",
				noTicketsMessage: "No tickets found with this status or search term.",
				buttons: {
					accept: "Accept",
				},
			},
			newTicketModal: {
				title: "Create Ticket",
				fieldLabel: "Type to search for a contact",
				add: "Add",
				buttons: {
					ok: "Save",
					cancel: "Cancel",
				},
			},
			mainDrawer: {
				listItems: {
					dashboard: "Dashboard",
					connections: "Connections",
					tickets: "Tickets",
					quickMessages: "Quick Responses",
					contacts: "Contacts",
					queues: "Queues & Chatbot",
					tags: "Tags",
					administration: "Administration",
					users: "Users",
					settings: "Settings",
					helps: "Help",
					messagesAPI: "API",
					schedules: "Schedules",
					campaigns: "Campaigns",
					annoucements: "Announcements",
					chats: "Internal Chat",
					financeiro: "Financial",
					createaccount: "User Creation",
					companies: "Companies",
				},
				appBar: {
					user: {
						profile: "Profile",
						logout: "Logout",
					},
				},
			},
			notifications: {
				noTickets: "No notifications.",
			},
			queues: {
				title: "Queues",
				table: {
					name: "Name",
					color: "Color",
					greeting: "Greeting message",
					actions: "Actions",
				},
				buttons: {
					add: "Add queue",
				},
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage: "Are you sure? It cannot be reverted! Tickets in this queue will still exist, but will not have any queues assigned.",
				},
			},
			queueSelect: {
				inputLabel: "Queues",
			},
			users: {
				title: "Users",
				table: {
					name: "Name",
					email: "Email",
					profile: "Profile",
					actions: "Actions",
				},
				buttons: {
					add: "Add user",
				},
				toasts: {
					deleted: "User deleted sucessfully.",
				},
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage: "All user data will be lost. Users' open tickets will be moved to queue.",
				},
			},
			settings: {
				success: "Settings saved successfully.",
				title: "Settings",
				settings: {
					userCreation: {
						name: "User creation",
						options: {
							enabled: "Enabled",
							disabled: "Disabled",
						},
					},
				},
			},
			messagesList: {
				header: {
					assignedTo: "Assigned to:",
					buttons: {
						return: "Return",
						resolve: "Resolve",
						reopen: "Reopen",
						accept: "Accept",
					},
				},
			},
			messagesInput: {
				placeholderOpen: "Type a message",
				placeholderClosed: "Reopen or accept this ticket to send a message.",
				signMessage: "Sign",
			},
			contactDrawer: {
				header: "Contact details",
				buttons: {
					edit: "Edit contact",
				},
				extraInfo: "Other information",
			},
			ticketOptionsMenu: {
				delete: "Delete",
				transfer: "Transfer",
				confirmationModal: {
					title: "Delete ticket #",
					titleFrom: "from contact ",
					message: "Attention! All ticket's related messages will be lost.",
				},
				buttons: {
					delete: "Delete",
					cancel: "Cancel",
				},
			},
			confirmationModal: {
				buttons: {
					confirm: "Ok",
					cancel: "Cancel",
				},
			},
			messageOptionsMenu: {
				delete: "Delete",
				reply: "Reply",
				confirmationModal: {
					title: "Delete message?",
					message: "This action cannot be reverted.",
				},
			},
			backendErrors: {
				ERR_NO_OTHER_WHATSAPP: "There must be at lest one default WhatsApp connection.",
				ERR_NO_DEF_WAPP_FOUND: "No default WhatsApp found. Check connections page.",
				ERR_WAPP_NOT_INITIALIZED: "This WhatsApp session is not initialized. Check connections page.",
				ERR_WAPP_CHECK_CONTACT: "Could not check WhatsApp contact. Check connections page.",
				ERR_WAPP_INVALID_CONTACT: "This is not a valid whatsapp number.",
				ERR_WAPP_DOWNLOAD_MEDIA: "Could not download media from WhatsApp. Check connections page.",
				ERR_INVALID_CREDENTIALS: "Authentication error. Please try again.",
				ERR_SENDING_WAPP_MSG: "Error sending WhatsApp message. Check connections page.",
				ERR_DELETE_WAPP_MSG: "Couldn't delete message from WhatsApp.",
				ERR_OTHER_OPEN_TICKET: "There's already an open ticket for this contact.",
				ERR_SESSION_EXPIRED: "Session expired. Please login.",
				ERR_SESSION_TOKEN_INVALID: "Invalid token. We'll try to assign a new one on next request.",
				ERR_USER_CREATION_DISABLED: "User creation was disabled by administrator.",
				ERR_NO_PERMISSION: "You don't have permission to access this resource.",
				ERR_DUPLICATED_CONTACT: "A contact with this number already exists.",
				ERR_NO_SETTING_FOUND: "No setting found with this ID.",
				ERR_NO_CONTACT_FOUND: "No contact found with this ID.",
				ERR_NO_TICKET_FOUND: "No ticket found with this ID.",
				ERR_NO_USER_FOUND: "No user found with this ID.",
				ERR_NO_WAPP_FOUND: "No WhatsApp found with this ID.",
				ERR_NO_ERROR_FOUND: "An error occurred, but we are already checking.",
				ERR_CREATING_MESSAGE: "Error while creating message on database.",
				ERR_CREATING_TICKET: "Error while creating ticket on database.",
				ERR_FETCH_WAPP_MSG: "Error fetching the message in WhtasApp, maybe it is too old.",
				ERR_QUEUE_COLOR_ALREADY_EXISTS: "This color is already in use, pick another one.",
				ERR_WAPP_GREETING_REQUIRED: "Greeting message is required if there is more than one queue.",
				ERR_INSUFFICIENT_RESOURCES: "The browser encountered a resource shortage problem while trying to load a page.",
			},
		},
	},
};

export { messages };
