let balance = 100;

function deposit(amount) {
    balance += amount;
}

function withdraw(amount) {
    balance -= amount;
}

withdraw(1000);
console.log(balance);

// Objetos literales

const account = {
    owner: 'Felipe',
    balance: 100,
    deposit(amount) {
        if (amount <= 0) throw new Error('El monto debe de ser mayor a 0');
        this.balance += amount;
        return this.balance;
    },

    withdraw(amount) {
        if (amount <= 0) throw new Error('El monto debe ser mayor a 0');
        if (amount > this.balance) throw new Error('Fondos insuficientes');
        this.balance -= amount;
        return this.balance;
    },
};

console.log(account.balance); // 100
account.deposit(50); // 150
account.withdraw(70) // 80
console.log(account.balance); // 80
