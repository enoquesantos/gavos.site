var App = {
    // object with form data
    projectForm: {
        orgs: {}
    },

    // the types of coverage by application
    COVERAGE_TYPES: {
        'country': 'coverage-country',
        'state': 'coverage-location',
        'city': ['coverage-location', 'coverage-city'],
        'institutional': ['coverage-org'],
    },

    // hide an element
    hide: function (elem) {
        if (typeof elem === 'string') {
            elem = this.elementByidOrName(elem)
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
            elem = this.elementByidOrName(elem)
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
    elementByidOrName: function(id) {
        let el = document.getElementById(id)
        if (el === null) {
            el = document.getElementsByName(el)
            if (el.length) {
                return el[0]
            }
        }
        return el
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
        dataCityByState.forEach(function(obj, _idx, _arr) {
            let option = document.createElement('option')
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

    formSerialize: function(formElement, requiredFields) {
        if (!requiredFields) { requiredFields = [] }
        const values = {}
        const inputs = formElement.elements
        for (let i = 0; i < inputs.length; i++) {
            const name = inputs[i].name
            if (!name) { continue }
            let val = inputs[i].value
            if (typeof val === 'undefined' || val === '') {
                val = null
            }
            if (val === null && (requiredFields.length == 0 || requiredFields.indexOf(name) > -1)) {
                throw new Error("Field empty: " + name)
            }
            values[name] = val
        }
        return values
    },

    dumpValues: function(formElement) {
        const r = this.formSerialize(formElement)
        console.log("form serialized:")
        console.log(JSON.stringify(r))
    },

    simulateClick: function (elem) {
        var evt = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        elem.dispatchEvent(evt)
    },

    createDelOrgBtn: function(text) {
        const html = `<div class="dropdown">
                        <button class="btn btn-info dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            ${text}
                        </button>
                        <ul class="dropdown-menu bg-info">
                            <li><a class="dropdown-item del-org" href="#"><i class="bi bi-x-square me-2"></i>Remover</a></li>
                            <li><a class="dropdown-item update-org" href="#"><i class="bi bi-check-square me-2"></i>Atualizar</a></li>
                        </ul>
                    </div>`
        return html
    },
}

document.addEventListener('DOMContentLoaded', function () {
    let selectHeader = App.elementByidOrName('header')
    if (selectHeader) {
        document.addEventListener('scroll', function () { App.headerScrolled(selectHeader) })
    }

    const coverage = document.getElementById('coverage')
    const coverageState = App.elementByidOrName('coverage-state')
    const ocorrunceTypeItem = App.elementByidOrName('ocorrunce-type')
    const orgState = App.elementByidOrName('org-state')

    App.setStateChangeListener(coverageState, App.elementByidOrName('coverage-city'))
    App.setStateSelect(coverageState)

    App.setStateChangeListener(orgState, App.elementByidOrName('org-city'))
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

    ocorrunceTypeItem.addEventListener('change', function(e) {
        const ocorrunceTypeOther = App.elementByidOrName('ocorrunce_type_other')
        if (this.value === 'other') {
            this.parentNode.classList.replace('col-12', 'col-6')
            App.show(ocorrunceTypeOther.parentNode)
            ocorrunceTypeOther.removeAttribute('readonly')
            ocorrunceTypeOther.setAttribute('autofocus', 'autofocus')
            ocorrunceTypeOther.value = ""
            ocorrunceTypeOther.focus()
        } else {
            App.hide(ocorrunceTypeOther.parentNode)
            this.parentNode.classList.replace('col-6', 'col-12')
            ocorrunceTypeOther.setAttribute('readonly', 'readonly')
            ocorrunceTypeOther.value = this.options[this.selectedIndex].text
        }
    })

    // turn 'tags-input' on project users field
    new TomSelect('#project_users', {
        persist: true,
        createOnBlur: true,
        create: true
    })

    // add mask in CNPJ fields
    const elements = document.getElementsByClassName('cnpj')
    if (elements.length) {
        const maskOptions = {
          mask: '00.000.000/0000-00'
        }
        // https://imask.js.org/guide.html
        Array.from(elements).forEach(function(el, _idx, _arr) {
            IMask(el, maskOptions)
        })
    }

    const addOrgBtn = App.elementByidOrName('add-org-btn')
    addOrgBtn.addEventListener('click', function(e) {
        e.preventDefault()

        // get form element and serialize all data
        const form = App.elementByidOrName('add-org-form')

        // auto validate the form. all field's required
        try {
            const json = App.formSerialize(form)

            App.projectForm.orgs[json.org_doc] = json
            App.hide(App.elementByidOrName('org-list-info'))

            const covarageInst = App.elementByidOrName('coverage-institutional')
            covarageInst.innerHTML += App.createDelOrgBtn(json.org_doc)

            // force to close modal
            App.simulateClick(App.elementByidOrName('add-org-cancel'))
        } catch (e) {
            console.error(e)
            alert("Todos os campos do formulário de cadastro da instituição são de preechimento obrigatório!")
        }
    })
})