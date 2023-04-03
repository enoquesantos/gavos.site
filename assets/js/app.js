var App = {
    d: document,

    modal: {
        userMsg: {},
        orgCreation: {},
    },

    // object with form data
    project: {
        setup: {
            project_name: "",
            occurrence_type: "",
            occurrence_type_other: "",
            coverage: "",
            coverage_country: "",
            coverage_state: "",
            coverage_city: "",
            project_owner_name: "",
            project_owner_mail: "",
            project_users: [],
        },
        orgs: {},
        editing: ""
    },

    // the types of coverage by application
    COVERAGE_TYPES: {
        'country': 'coverage-country',
        'state': 'coverage-location',
        'city': ['coverage-location', 'coverage-city'],
        'organization': ['coverage-organization'],
    },

    setupCarousel: {},

    // hide an element
    hide: function (elem) {
        if (typeof elem === 'string') {
            elem = this.element(elem)
        }
        try {
            if (elem.classList.contains('d-block')) {
                elem.classList.replace('d-block', 'd-none')
            } else {
                elem.classList.add('d-none')
            }
        } catch (e) {
            console.error("Error on try to hide element:")
            console.error(e)
        }
    },

    // hide an element
    show: function (elem) {
        if (typeof elem === 'string') {
            elem = this.element(elem)
        }
        try {
            if (elem.classList.contains('d-none')) {
                elem.classList.replace('d-none', 'd-block')
            } else {
                elem.classList.add('d-block')
            }
        } catch (e) {
            console.error("Error on try to show element:")
            console.error(e)
        }
    },

    // toggle element visibility
    toggle: function (elem) {
        if (elem.classList.contains('d-none')) {
            this.hide(elem)
        } else {
            this.show(elem)
        }
    },

    // find element into DOM by id or by name (for inputs)
    element: function(idOrName) {
        let e = this.d.getElementById(idOrName)
        if (e === null) {
            e = this.d.getElementsByName(idOrName)
            if (e.length) {
                return e[0]
            }
        }
        return e
    },

    // find element into DOM by id or by name (for inputs)
    elements: function(className, oneItem) {
        let es = this.d.getElementsByClassName(className)
        return !es.length ? null : (oneItem ? es[0] : es)
    },

    // find the key name from object using a value
    getKeyByValue: function(object, value) {
        let _k = null
        for (let key in object) {
            if (object[key] === value) {
                _k = key
                break
            }
        }
        return _k
    },

    removeOptions: function(selectElement) {
        var i, len = selectElement.options.length - 1
        for (i = len; i >= 0; i--) {
           selectElement.remove(i)
        }
    },

    headerScrolled: function(selectHeader) {
        if (window.scrollY > 100) {
            selectHeader.classList.add('header-scrolled')
        } else {
            selectHeader.classList.remove('header-scrolled')
        }
    },

    setStateSelect: function(stateField) {
        // populate the state select
        const self = this
        dataCityByState.forEach(function(obj, _idx, _arr) {
            let option = self.d.createElement('option')
            option.text = obj.nome
            option.value = obj.sigla
            stateField.appendChild(option)
        })
        stateField.dispatchEvent(new Event('change'))
    },

    setStateChangeListener: function(stateField, cityField) {
        // on state change, clear and populate the cities
        stateField.addEventListener('change', function(e) {
            // if (coverage.options[coverage.selectedIndex].value != 'city') { return }

            const currentValue = e.target.value
            const stateCities = dataCityByState.find(function(obj) { return obj.sigla === currentValue })

            // clear all old options
            App.removeOptions(cityField)

            // populate the select with the option
            stateCities.cidades.forEach(function(val, _idx, _arr) {
                let option = document.createElement('option')
                option.text = val
                option.value = val
                cityField.appendChild(option)
            })
        })
    },

    setForm: function(formElement, dataJson) {
        if (!dataJson || typeof dataJson === 'undefined') {
            console.error("data json is invalid!")
            return
        }
        const inputs = formElement.elements
        for (let i = 0; i < inputs.length; i++) {
            const name = inputs[i].name
            if (!name) {
                continue
            }
            if (typeof dataJson[name] !== 'undefined') {
                inputs[i].value = dataJson[name]
                const evt = new Event('change')
                inputs[i].dispatchEvent(evt)
            }
        }
    },

    formSerialize: function(formElement, requiredFields) {
        if (!requiredFields || !Array.isArray(requiredFields)) {
            requiredFields = []
        }
        const inputs = formElement.elements
        let f = {}, v = null, n = "", values = {}
        for (let i = 0; i < inputs.length; i++) {
            try {
                if (!inputs[i].name) continue
                f = document.getElementsByName(inputs[i].name)[0]
                n = f.name
                v = f.value
                if (typeof v === 'undefined' || v === '') {
                    v = null
                }
                if (v === null && (f.classList.contains('req') || requiredFields.indexOf(n) > -1)) {
                    throw new Error(`O campo "${n}" deve ser preenchido.`)
                }
                values[n] = v
            } catch (err) {
                console.error(err)
            }
        }
        return values
    },

    log: function(data) {
        console.log("App.log:")
        console.log(JSON.stringify(data))
    },

    simulateClick: function (elem) {
        const evt = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        })
        elem.dispatchEvent(evt)
    },

    showUserMessage: function(msg) {
        App.modal.userMsg.hide()
        App.element('message-modal-body').innerHTML = msg
        setTimeout(() => {            
            App.modal.userMsg.show()
        }, 50)
    },

    createEditOrgBtn: function(text) {
        const html = `<div id="org-item-${text}" class="dropdown float-start pe-2">
                        <button id="org-${text}" class="btn btn-info dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            ${text}
                        </button>
                        <ul class="dropdown-menu bg-info">
                            <li><a id="del-org-${text}" class="dropdown-item del-org" href="javascript:void(0)"><i class="bi bi-x-square me-2"></i>Remover</a></li>
                            <li><a id="upd-org-${text}" class="dropdown-item upd-org" href="javascript:void(0)"><i class="bi bi-check-square me-2"></i>Atualizar</a></li>
                        </ul>
                    </div>`
        return html
    },

    asyncCall: function(func, timeout) {
        setTimeout(() => { func() }, timeout || 1)
    },

    validate: function() {
        const json = App.formSerialize(App.element('project-setup-form'))

        App.log(json)
        // this.project.setup = json
        // const data = { ...this.project.setup, ...this.project.orgs }

        function hasValue(attrName) {
            if (typeof json[attrName] == 'undefined' || !json[attrName]) {
                return false
            }
            return true
        }

        if (!hasValue('project_name')) {
            throw new Error("Para criar um novo projeto, é necessário incluir o nome do projeto.")
        }
        if (!hasValue('coverage')) {
            throw new Error("Para criar um novo projeto, é necessário incluir a abrangência da captura de dados.")
        }
        if (!hasValue('occurrence_type') || (json.occurrence_type == "other" && !hasValue('occurrence_type_other'))) {
            throw new Error("Não foi possível identificar o tipo de ocorrência.")
        }
        if (!hasValue('occurrence_type') || (json.coverage == "organization" && !Object.keys(this.project.orgs).length)) {
            // validate minimum organization data
            throw new Error("Para cobertura do projeto por organizacão, é necessário incluir no mínimo uma organização.")
        }
    },

    submitNewProject: function() {
        fetch('/create-project', this.project.setup).then(function(response) {
            if (response.error) {
                App.showUserMessage(response.error)
            }
        })
    },

    autoSestForm: function() {
        const data = {
            'project_name': "Controle de ocorrências H1N1 em Salvador",
            'occurrence_type': "covid",
            'coverage': "city",
            'coverage_country': "br",
            'coverage_state': "BA",
            'coverage_city': "Salvador",
            'project_owner_name': "José da Silva",
            'project_owner_mail': "jose.silva@gavos.com.br",
            'project_users': "maria.jose@gavos.com.br, adgenor.cavalcante@gavos.com.br"
        }
        for (let k in data) {
            const f = App.element(k)
            if (f !== null) {
                f.value = data[k]
                f.dispatchEvent(new Event('change'))
                if (k === 'project_users') {
                    f.tomselect.destroy()
                    const newControl = new TomSelect(`#${f.id}`)
                    newControl.addItem(f.value)
                }
            }
        }
    }
}

App.d.addEventListener('DOMContentLoaded', function () {
    let selectHeader = App.element('header')
    if (selectHeader) {
        App.d.addEventListener('scroll', function () { App.headerScrolled(selectHeader) })
    }

    const coverage = App.element('coverage')
    const coverageState = App.element('coverage-state')
    const occurrenceTypeItem = App.element('occurrence-type')
    const orgState = App.element('org-state')

    App.modal.userMsg = new bootstrap.Modal(App.element('msg-modal'), {})
    App.modal.orgCreation = new bootstrap.Modal(App.element('org-modal'), {})
    App.setupCarousel = new bootstrap.Carousel(App.element('setup-carousel'))
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    })

    App.setStateChangeListener(coverageState, App.element('coverage-city'))
    App.setStateSelect(coverageState)

    App.setStateChangeListener(orgState, App.element('org-city'))
    App.setStateSelect(orgState)

    coverage.addEventListener('change', function(e) {
        const currentValue = e.target.value
        const values = Object.values(App.COVERAGE_TYPES)
        values.forEach(function(val, _idx, _arr) {
            if (Array.isArray(val)) {
                val.forEach(function(option) {
                    App.hide(option)
                })
            } else {
                App.hide(val)
            }
        })
        const toShow = App.COVERAGE_TYPES[currentValue]
        if (Array.isArray(toShow)) {
            toShow.forEach(function(option) {
                App.show(option)
            })
        } else {
            App.show(toShow)
        }

        if (currentValue == 'city') {
            coverageState.dispatchEvent(new Event('change'))
        }
    })

    occurrenceTypeItem.addEventListener('change', function(e) {
        const occurrenceTypeOther = App.element('occurrence-type-other')
        if (this.value === 'other') {
            this.parentNode.classList.replace('col-12', 'col-6')
            App.show(occurrenceTypeOther.parentNode)
            occurrenceTypeOther.removeAttribute('readonly')
            occurrenceTypeOther.setAttribute('autofocus', 'autofocus')
            occurrenceTypeOther.value = ""
            occurrenceTypeOther.focus()
        } else {
            App.hide(occurrenceTypeOther.parentNode)
            this.parentNode.classList.replace('col-6', 'col-12')
            occurrenceTypeOther.setAttribute('readonly', 'readonly')
            occurrenceTypeOther.value = this.options[this.selectedIndex].text
        }
    })

    // turn input as 'tags-list' style
    // we uses: https://tom-select.js.org
    new TomSelect('#project-users', {
        persist: false,
        createOnBlur: true,
        create: true
    })

    // add mask in CNPJ fields
    // we uses: https://imask.js.org
    const elements = App.elements('cnpj')
    if (elements.length) {
        const maskOptions = {
          mask: '00.000.000/0000-00'
        }
        Array.from(elements).forEach(function(el, _idx, _arr) {
            IMask(el, maskOptions)
        })
    }

    const addOrgBtn = App.element('add-org-btn')
    addOrgBtn.addEventListener('click', function(e) {
        e.preventDefault()
        const form = App.element('org-form')
        form.dispatchEvent(new Event('reset'))
        form.reset()
    })

    App.element('org-modal').addEventListener('hidden.bs.modal', function (e) {
        App.project.editing = ""
    })

    const saveOrgBtn = App.element('save-org-btn')
    saveOrgBtn.addEventListener('click', function(e) {
        e.preventDefault()

        try {
            // get form element and serialize all data
            const form = App.element('org-form')

            // auto validate the form. all field's required
            const json = App.formSerialize(form)
            const orgExists = (typeof App.project.orgs[json.org_doc] !== 'undefined')
            if (orgExists) {
                // update the button text
                App.element(`org-${json.org_doc}`).textContent = json.org_doc
            } else if (App.project.editing.length && App.project.editing !== json.org_doc) {
                App.element(`org-${App.project.editing}`).remove()
            }

            App.hide(App.element('org-list-info'))

            if (!orgExists) {
                const coverageInst = App.element('coverage-organization-list')
                coverageInst.innerHTML += App.createEditOrgBtn(json.org_doc)
            }

            App.project.orgs[json.org_doc] = json

            // close the modal
            App.simulateClick(App.element('save-org-cancel'))

            App.asyncCall(() => {
                form.reset(), 550
                const evt = new Event('change')
                form.dispatchEvent(evt)
            })
        } catch (e) {
            console.error(e)
            App.showUserMessage("Todos os campos do formulário de cadastro da empresa/organização são de preechimento obrigatório.")
        }
    })

    App.d.body.addEventListener('click', function(e) {
        const t = e.target
        if (t.classList.contains('del-org')) {
            e.preventDefault()
            const orgDoc = t.id.substring(8)
            App.element(`org-item-${orgDoc}`).remove()
            const otherItems = App.elements('del-org')
            if (!otherItems || !otherItems.length) {
                App.show(App.element('org-list-info'))
            }
            return false
        } else if (e.target.classList.contains('upd-org')) {
            e.preventDefault()
            const orgDoc = t.id.substring(8)
            const org = App.project.orgs[orgDoc]
            App.project.editing = orgDoc
            App.asyncCall(() => {
                App.setForm(App.element('org-form'), org)
                App.modal.orgCreation.show()
            })
            return false
        }
    })

    const previousSetupStep = App.element('previous-setup-step-btn')
    previousSetupStep.addEventListener('click', function(e) {
        e.preventDefault()
        App.hide(e.target)
        App.hide(App.element('submit-project-btn'))
        App.show(App.element('last-setup-step-btn'))
        App.setupCarousel.prev()
    })

    const lastSetupStep = App.element('last-setup-step-btn')
    lastSetupStep.addEventListener('click', function(e) {
        e.preventDefault()
        
        try {
            App.validate()
            
            // ***
            // if validate func not throw any error,
            // we can go to next step.
            // ***

            App.hide(e.target)
            App.show(App.element('previous-setup-step-btn'))
            App.show(App.element('submit-project-btn'))

            App.setupCarousel.next()
        } catch (err) {
            App.showUserMessage(err.message)
        }
    })

    // para fins de testes...
    App.autoSestForm()
})