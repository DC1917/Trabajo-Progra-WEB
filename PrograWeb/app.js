const express = require('express');
const path = require('path');
const mysql = require('mysql');
const multer = require('multer');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const uploadDirectory = path.join(__dirname, 'uploads');


const app = express();
const port = 3000;

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '191719Dd*',
    database: 'PlusTurbus'
});

connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ' + err.stack);
        return;
    }
    console.log('Conexión exitosa a la base de datos MySQL.');
});

// Configuración de Multer para subir archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//metodo para redireccionar a la página principal
app.use(express.static(path.join(__dirname, 'pagina_principal')));

// Validación 
const validarNoVacio = (value) => {
    if (!value.trim()) {
        throw new Error('Este campo es requerido');
    }
    return true;
};

// Método para registrar un usuario
app.post('/registrar_usuario', [
    body('nombreCompleto').custom(validarNoVacio).withMessage('Nombre completo es requerido'),
    body('correo').isEmail().withMessage('Correo no es válido'),
    body('nombreUsuario').custom(validarNoVacio).withMessage('Nombre de usuario es requerido'),
    body('claveWeb').custom(validarNoVacio).withMessage('Clave web es requerida'),
    body('rolId').isNumeric().withMessage('ID de rol es requerido y debe ser numérico')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombreCompleto, correo, nombreUsuario, claveWeb, rolId } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(claveWeb, 10);
        const sql = 'INSERT INTO usuarios (nombreCompleto, correo, nombreUsuario, claveWeb, rolId) VALUES (?, ?, ?, ?, ?)';
        connection.query(sql, [nombreCompleto, correo, nombreUsuario, hashedPassword, rolId], (err, result) => {
            if (err) {
                console.error('Error al registrar el usuario:', err);
                return res.status(500).send('Error interno del servidor');
            }
            console.log('Usuario registrado correctamente.');
            res.redirect('login.html'); 
        });
    } catch (err) {
        console.error('Error al registrar el usuario:', err);
        res.status(500).send('Error al registrar el usuario');
    }
});

// Ruta para iniciar sesión
app.post('/iniciar_sesion', async (req, res) => {
    const { correo, claveWeb } = req.body;

    try {
        const sql = 'SELECT u.*, r.NombreRol FROM Usuarios u JOIN Roles r ON u.rolId = r.rolId WHERE u.Correo = ?';
        connection.query(sql, [correo], async (err, result) => {
            if (err) {
                console.error('Error al buscar usuario:', err);
                return res.status(500).send('Error interno del servidor');
            }

            if (result.length === 0) {
                return res.status(404).send('Credenciales incorrectas');
            }

            const usuario = result[0];
            const claveValida = await bcrypt.compare(claveWeb, usuario.ClaveWeb); // Aquí ajustamos el nombre de la columna
            if (!claveValida) {
                return res.status(401).send('Credenciales incorrectas');
            }

            // Redireccionar según el rol
            if (usuario.rolId === 2) { // Asegúrate de que rolId sea numérico para la comparación
                res.redirect('loginAdmin.html');
            } else {
                res.redirect('loginUsuario.html');
            }
        });
            
    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        res.status(500).send('Error al iniciar sesión');
    }
});

// Ruta para obtener los detalles de un usuario
app.get('/usuarios/:userId', (req, res) => {
    const { userId } = req.params;

    const query = 'SELECT userId, NombreCompleto, Correo, NombreUsuario FROM Usuarios WHERE userId = ?';
    connection.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error al obtener los detalles del usuario:', err);
            res.status(500).send('Error al obtener los detalles del usuario');
        } else {
            res.json(result[0]);
        }
    });
});

// Ruta para eliminar un usuario
app.delete('/eliminar_usuario/:userId', (req, res) => {
    const { userId } = req.params;

    const query = 'DELETE FROM Usuarios WHERE userId = ?';
    connection.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error al eliminar el usuario:', err);
            res.status(500).send('Error al eliminar el usuario');
        } else {
            res.status(200).send('Usuario eliminado exitosamente');
        }
    });
});

// Nueva ruta para mostrar todos los usuarios
app.get('/usuarios', (req, res) => {
    const query = 'SELECT userId, NombreCompleto, Correo, NombreUsuario FROM Usuarios';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los usuarios:', err);
            res.send('Error al obtener los usuarios');
        } else {
            res.json(results);
        }
    });
});

// Ruta para subir una imagen de perfil
app.post('/subir_imagen', upload.single('profileImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se ha subido ninguna imagen');
    }

    const imageUrl = req.file.filename; // Obtener el nombre del archivo subido

    // Insertar la URL de la imagen en la base de datos
    const insertQuery = 'INSERT INTO imagenes (imageUrl) VALUES (?)';
    connection.query(insertQuery, [imageUrl], (err, result) => {
        if (err) {
            console.error('Error al insertar imagen en la base de datos:', err);
            return res.status(500).send('Error interno del servidor al guardar la imagen');
        }
        console.log('Imagen subida y guardada en la base de datos correctamente.');
        res.status(200).send('Imagen subida y guardada correctamente');
    });
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}/`);
});