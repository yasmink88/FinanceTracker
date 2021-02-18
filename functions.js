
const modal = {
    open() {
        //open modal
        //add active class to modal
        document.querySelector('.modal_overlay').classList.add('active')
    },
    close() {
        //close modal
        //remove active class from modal
        document.querySelector('.modal_overlay').classList.remove('active')
    }
}

const storage = {

    
    get(){
       localStorage.clear()
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", transactions, JSON.stringify(transactions))
    }

}

const transcationsCalc = {
    all: storage.get(),
    
    add(transaction){
        transcationsCalc.all.push(transaction)
        app.reload()
    },

    remove(index) {
        transcationsCalc.all.splice(index, 1)
        app.reload()
    },

    income() {
        let sumIncome = 0;
        transcationsCalc.all.forEach(function(transaction){
            if(transaction.amount > 0) {
                sumIncome += transaction.amount;
            }

        })
        return sumIncome
    },

    expense() {
        let sumExpense = 0;
        transcationsCalc.all.forEach(function(transaction){
            if(transaction.amount < 0) {
                sumExpense += transaction.amount;
            }

        })
        return sumExpense
    },

    total() {
        return transcationsCalc.income() + transcationsCalc.expense()
    },

}

const dom = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = dom.innerHTMLTransaction(transaction, index)
       dom.transactionsContainer.appendChild(tr)
       tr.dataset.index = index
    },


    innerHTMLTransaction(transaction, index) {

        const cssClass = transaction.amount > 0 ? "income" : "expense"

        const amount = utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description} <span class="category">${transaction.category}</span></td>
            <td class="${cssClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td class="delete_transaction"><img src="./assets/minus.svg" alt="Delete transaction" onclick="transcationsCalc.remove(${index})"></td>
        `
            return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = utils.formatCurrency(transcationsCalc.income())
        document.getElementById('expenseDisplay').innerHTML = utils.formatCurrency(transcationsCalc.expense())
        document.getElementById('totalDisplay').innerHTML = utils.formatCurrency(transcationsCalc.total())
    },

    clearTransactions() {
        dom.transactionsContainer.innerHTML = ""
    }
}

const utils = {

    formatDate(date) {
        const splittedDate = date.split("-")
        return `
        ${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}
        `
    },

    // formatAmount(value) {
    //     value = Number(value) * 100
    //     return value
    // },
    
    formatAmount(value) {
        value = value * 100
        return Math.round(value)
    },

    formatCurrency(value) {
        const sign = Number(value) < 0 ? "-" : "+"
        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        
        return sign + value
    }
}

const form = {
    description: document.querySelector('#description'),
    category: document.querySelector('#category'),
    amount: document.querySelector('#amount'),
    date: document.querySelector('#date'),

    getValues() {
        return {
            description: form.description.value,
            category: form.category.value,
            amount: form.amount.value,
            date: form.date.value
        }
    },

    validateFields() {
        const {description, category, amount, date} = form.getValues()

        if(
            description.trim() === "" ||
            category.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === ""
            ) {
                throw new Error("Fields can't be empty!")
            }
    
    },

    formatValues() {
        let {description, category, amount, date} = form.getValues()
        amount = utils.formatAmount(amount)
        date = utils.formatDate(date)

        return {
            description,
            category,
            amount,
            date
        }
    },

    clearFields(){
        form.description.value = ""
        form.category.value = ""
        form.amount.value = ""
        form.date.value = ""

    },

    submit(event) {
        event.preventDefault()

        try {
            form.validateFields()
            const transaction = form.formatValues()
            transcationsCalc.add(transaction)
            form.clearFields()
            modal.close()
        } 
        
        catch (error) {
            alert(error.message)
        }
    }
}

const app = {
    init() {
        transcationsCalc.all.forEach(dom.addTransaction)
        dom.updateBalance()
        storage.set(transcationsCalc.all)
    },

    reload() {
        dom.clearTransactions()
        app.init()
    },
}

app.init()

