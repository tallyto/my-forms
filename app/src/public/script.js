document.addEventListener('DOMContentLoaded', function () {
    const formBuilder = document.getElementById('form-builder');
    const formFields = document.getElementById('form-fields');
    const addTextFieldBtn = document.getElementById('add-text-field');
    const addCheckboxBtn = document.getElementById('add-checkbox');
    const addRadioBtn = document.getElementById('add-radio');
    const addDateBtn = document.getElementById('add-date');
    const saveFormBtn = document.getElementById('save-form');
    const formsList = document.getElementById('forms-list');

    let fieldCounter = 0;

    addTextFieldBtn.addEventListener('click', function () {
        addFormField('text', 'Text Field');
    });

    addCheckboxBtn.addEventListener('click', function () {
        addFormField('checkbox', 'Checkbox');
    });

    addRadioBtn.addEventListener('click', function () {
        addFormField('radio', 'Radio Button');
    });

    addDateBtn.addEventListener('click', function () {
        addFormField('date', 'Date Field');
    });

    saveFormBtn.addEventListener('click', function () {
        saveForm();
    });

    formsList.addEventListener('click', function (event) {
        if (event.target && event.target.matches('li')) {
            const formId = event.target.dataset.formId;
            openForm(formId);
        }
    });

    document.getElementById('export-pdf').addEventListener('click', function() {
        exportAsPDF();
    });

     // Função para exportar o formulário preenchido como PDF
     async function exportAsPDF() {
        try {
            // Seletor para o conteúdo do formulário que será exportado como PDF
            const formContent = document.getElementById('form-builder').innerHTML;

            // Configurações para a exportação do PDF
            const options = {
                filename: 'formulario.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            // Gerar o PDF a partir do conteúdo do formulário
            await html2pdf().set(options).from(formContent).save();

            alert('Formulário exportado como PDF com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar o formulário como PDF:', error);
            alert('Erro ao exportar o formulário como PDF. Por favor, tente novamente mais tarde.');
        }
    }

    async function loadForms() {
        try {
            const response = await fetch('/api/forms');
            const forms = await response.json();

            formsList.innerHTML = '';

            forms.forEach(form => {
                const listItem = document.createElement('li');
                listItem.textContent = `Formulário #${form._id}`;
                listItem.dataset.formId = form._id; // Adicionamos um atributo de dados para armazenar o ID do formulário
                formsList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Erro ao carregar formulários:', error);
        }
    }

    async function openForm(formId) {
        try {
            const response = await fetch(`/api/forms/${formId}`);
            const formData = await response.json();

            // Limpa os campos do formulário atual
            formFields.innerHTML = '';

            // Adiciona os campos do formulário selecionado ao formulário atual
            formData.fields.forEach(field => {
                addFormField(field.type, field.label);
            });
        } catch (error) {
            console.error('Erro ao abrir o formulário:', error);
        }
    }

    function addFormField(type, label) {
        const fieldId = `field-${fieldCounter}`;
        const field = document.createElement('div');
        field.innerHTML = `
            <label for="${fieldId}">${label}:</label>
            <input type="${type}" id="${fieldId}" name="${fieldId}">
        `;
        formFields.appendChild(field);
        fieldCounter++;
    }

    async function saveForm() {
        const fields = [];
        const formElements = formFields.querySelectorAll('input');
        formElements.forEach(element => {
            fields.push({
                type: element.type,
                label: element.name,
                value: element.value
            });
        });

        try {
            const response = await fetch('/api/forms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fields })
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar o formulário');
            }

            alert('Formulário salvo com sucesso!');
            loadForms();
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao salvar o formulário. Por favor, tente novamente mais tarde.');
        }
    }

    loadForms();
});
