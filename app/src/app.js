const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexão com o banco de dados MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/test');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão com o MongoDB:'));
db.once('open', () => {
    console.log('Conectado ao banco de dados MongoDB');
});

// Modelo do formulário
const FormSchema = new mongoose.Schema({
    fields: [{ type: Object }]
});
const Form = mongoose.model('Form', FormSchema);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));



// Rota para salvar o formulário
app.post('/api/forms', async (req, res) => {
    try {
        const { fields } = req.body;
        const newForm = new Form({ fields });
        await newForm.save();
        res.status(201).json(newForm);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro interno do servidor');
    }
});

// Rota para obter todos os formulários salvos
app.get('/api/forms', async (req, res) => {
    try {
        const forms = await Form.find();
        res.status(200).json(forms);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para obter um formulário específico por ID
app.get('/api/forms/:id', async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) {
            return res.status(404).json({ error: 'Formulário não encontrado' });
        }
        res.status(200).json(form);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
