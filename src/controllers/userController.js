const bcryptjs = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const db = require("../database/models");

const PATH_PUBLIC_IMAGES = path.join(__dirname, "../../public/img/users/");

const userController = {
    loginView: (req, res) => {
        const showLinks = req.session.usuario ? true : false;
        res.render("users/login", { showLinks });
    },
    login: (req, res) => {
        const { email, password } = req.body;
        const showLinks = req.session.usuario ? true : false;

        db.Users.findOne({ where: { email } }).then((user) => {
            if (user) {
                let correctPassword = bcryptjs.compareSync(
                    password,
                    user.password
                );

                if (correctPassword) {
                    req.session.usuario = user;
                    return res.redirect("/products");
                }

                return res.render("users/login", {
                    errors: {
                        email: {
                            msg: "LA CONSTRASEÑA ES INCORRRECTA",
                        },
                    },
                    showLinks,
                });
            }

            return res.render("users/login", {
                errors: {
                    email: {
                        msg: "USUARIO NO ENCONTRADO",
                    },
                },
                showLinks,
            });
        });
    },
    registerView: (req, res) => {
        const showLinks = req.session.usuario ? true : false;
        res.render("users/register", { showLinks });
    },
    register: async (req, res) => {
        try {
            const { firstName, lastName, email, password } = req.body;
            const fileUpload = req.file;

            // SI no se carga el archivo informo de un error
            if (!fileUpload) {
                const error = new Error("Por favor seleccione un archivo");
                error.httpStatusCode = 400;
                return next(error);
            }

            // Encriptar la contraseña
            const hashedPassword = await bcryptjs.hash(password, 10);

            // Crear el objeto de usuario
            const newUser = {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                image: fileUpload.filename,
            };

            db.Users.create(newUser)
                .then((status) => {
                    res.redirect("/login"); // Redirigir a la página de inicio de sesión
                })
                .catch((err) => console.log(err));
        } catch (error) {
            console.error(error);
            res.status(500).send("Error en el servidor");
        }
    },
    misTickets: (req, res) => {
        const { usuario } = req.session;
        const showLinks = req.session.usuario ? true : false;

        res.render("users/myTickets", { idUsuario: usuario.id, showLinks });
    },
    miCarrito: (req, res) => {
        const { usuario } = req.session;
        const showLinks = req.session.usuario ? true : false;

        res.render("products/productCart", {
            idUsuario: usuario.id,
            showLinks,
        });
    },
    miPerfil: (req, res) => {
        const { usuario } = req.session;
        const showLinks = req.session.usuario ? true : false;

        const id = usuario.id;

        db.Users.findByPk(id)
            .then((user) => {
                res.render("users/myPerfil", {
                    miperfil: user,
                    idUsuario: usuario.id,
                    showLinks,
                });
            })
            .catch((err) => console.log(err));
    },
    editView: (req, res) => {
        const { usuario } = req.session;
        const showLinks = req.session.usuario ? true : false;
        const id = usuario.id;
        db.Users.findByPk(id)
            .then((user) => {
                res.render("users/editUser", {
                    miperfil: user,
                    idUsuario: usuario.id,
                    showLinks,
                });
            })
            .catch((err) => console.log(err));
    },
    editUser: async (req, res) => {
        const { id } = req.params;
        const fileUpload = req.file;
        const { firstName, lastName, email, password } = req.body;

        const editedUser = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            //image: fileUpload ? fileUpload.filename : user.image,
        };

        if (password) {
            editedUser.password = bcryptjs.hashSync(password, 10);
        }

        if (fileUpload) {
            // asigno la nueva imagen a cargar
            editedUser.image = fileUpload.filename;

            // elimino la imagen anterior
            db.Users.findByPk(id).then((user) => {
                if (user) {
                    const pathFile = `${PATH_PUBLIC_IMAGES}${user.image}`;

                    // verifico si existe la imagen correspondiente al evento
                    const existFile = fs.existsSync(pathFile);

                    if (existFile) {
                        // Primero elimino la imagen correspondiente al evento
                        fs.unlinkSync(pathFile);
                    }
                }
            });
        }

        db.Users.update(editedUser, { where: { id } })
            .then((data) => {
                res.redirect(`/myPerfil/${id}`);
            })
            .catch((err) => console.log(err));
    },
    logout: (req, res)=>{
        req.session.destroy();
        return res.redirect("/")
    }
};

module.exports = userController;
