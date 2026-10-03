const display = document.getElementById("display");
const degRadBtn = document.getElementById("degRad");
const sinBtn = document.getElementById("sin");
const cosBtn = document.getElementById("cos");
const tanBtn = document.getElementById("tan");

let expression = "";
let mode = "DEG";
let second = false;
let resetOnNextInput = false;

function render() {
    if (!display) return;
    display.innerText = expression || "0";
    display.scrollLeft = display.scrollWidth;
}

function isErrorState() {
    return (
        expression === "Error" ||
        expression === "Undefined" ||
        expression === "Infinity" ||
        expression === "-Infinity"
    );
}

function isOperator(value) {
    return ["+", "-", "×", "÷", "^", "%"].includes(value);
}

function isDigit(value) {
    return /^[0-9]$/.test(value);
}

function isValueEnding(char) {
    return /[0-9)π]/.test(char);
}

function clearAll() {
    expression = "";
    resetOnNextInput = false;
    render();
}

window.toRad = function (x) {
    return (x * Math.PI) / 180;
};

window.toDeg = function (x) {
    return (x * 180) / Math.PI;
};

window.calcSin = function (x) {
    const rad = mode === "DEG" ? window.toRad(x) : x;
    return Math.sin(rad);
};

window.calcCos = function (x) {
    const rad = mode === "DEG" ? window.toRad(x) : x;
    return Math.cos(rad);
};

window.calcTan = function (x) {
    const rad = mode === "DEG" ? window.toRad(x) : x;

    if (Math.abs(Math.cos(rad)) < 1e-12) {
        return Infinity;
    }

    return Math.tan(rad);
};

window.calcAsin = function (x) {
    if (x < -1 || x > 1) {
        return NaN;
    }

    const result = Math.asin(x);

    return mode === "DEG"
        ? window.toDeg(result)
        : result;
};

window.calcAcos = function (x) {
    if (x < -1 || x > 1) {
        return NaN;
    }

    const result = Math.acos(x);

    return mode === "DEG"
        ? window.toDeg(result)
        : result;
};

window.calcAtan = function (x) {
    const result = Math.atan(x);

    return mode === "DEG"
        ? window.toDeg(result)
        : result;
};

window.calcLn = function (x) {
    return x > 0 ? Math.log(x) : NaN;
};

window.calcLog = function (x) {
    return x > 0 ? Math.log10(x) : NaN;
};

window.calcFactorial = function (n) {
    if (!Number.isFinite(n)) {
        return NaN;
    }

    if (n < 0 || !Number.isInteger(n)) {
        return NaN;
    }

    if (n > 170) {
        return Infinity;
    }

    if (n === 0 || n === 1) {
        return 1;
    }

    let result = 1;

    for (let i = 2; i <= n; i++) {
        result *= i;
    }

    return result;
};

function press(val) {
    if (isErrorState()) {
        clearAll();
    }

    if (resetOnNextInput) {
        if (
            !isOperator(val) &&
            val !== ")" &&
            val !== "!"
        ) {
            expression = "";
        }

        resetOnNextInput = false;
    }

    if (isOperator(val)) {
        insertOperator(val);
        return;
    }

    if (val === ".") {
        pressDot();
        return;
    }

    if (isDigit(val)) {
        if (expression === "0") {
            expression = val;
        } else {
            expression += val;
        }

        render();
        return;
    }

    if (val === "(") {
        pressOpenParen();
        return;
    }

    if (val === ")") {
        pressCloseParen();
        return;
    }

    if (val === "π") {
        const lastChar = expression.slice(-1);

        if (isValueEnding(lastChar)) {
            expression += "×";
        }

        expression += "π";

        render();
        return;
    }

    if (
        val === "sin" ||
        val === "cos" ||
        val === "tan"
    ) {
        pressTrig(val);
        return;
    }

    if (
        val === "asin" ||
        val === "acos" ||
        val === "atan"
    ) {
        pressFunction(val);
        return;
    }

    if (val === "ln(") {
        pressFunction("ln");
        return;
    }

    if (val === "log(") {
        pressFunction("log");
        return;
    }

    if (val === "ln") {
        pressFunction("ln");
        return;
    }

    if (val === "log") {
        pressFunction("log");
        return;
    }
}

function insertOperator(op) {
    if (isErrorState()) {
        clearAll();
    }

    resetOnNextInput = false;

    const lastChar = expression.slice(-1);

    if (expression === "") {
        if (op === "-") {
            expression = "-";
            render();
        }

        return;
    }

    if (lastChar === "(") {
        if (op === "-") {
            expression += "-";
            render();
        }

        return;
    }

    if (isOperator(lastChar)) {
        if (op === "-" && lastChar !== "-") {
            expression += "-";
            render();
            return;
        }

        if (lastChar === "-") {
            return;
        }

        expression =
            expression.slice(0, -1) + op;

        render();
        return;
    }

    if (!isValueEnding(lastChar)) {
        return;
    }

    expression += op;
    render();
}

function pressDot() {
    if (isErrorState()) {
        clearAll();
    }

    if (resetOnNextInput) {
        expression = "";
        resetOnNextInput = false;
    }

    const parts = expression.split(/[^0-9.]/);
    const currentNumber = parts[parts.length - 1];

    if (currentNumber.includes(".")) {
        return;
    }

    if (
        expression === "" ||
        expression.endsWith("(") ||
        isOperator(expression.slice(-1))
    ) {
        expression += "0.";
    } else {
        expression += ".";
    }

    render();
}

function pressOpenParen() {
    if (isErrorState()) {
        clearAll();
    }

    if (resetOnNextInput) {
        expression = "";
        resetOnNextInput = false;
    }

    const lastChar = expression.slice(-1);

    if (isValueEnding(lastChar)) {
        expression += "×";
    }

    expression += "(";

    render();
}

function pressCloseParen() {
    if (isErrorState() || resetOnNextInput) {
        return;
    }

    const openCount =
        (expression.match(/\(/g) || []).length;

    const closeCount =
        (expression.match(/\)/g) || []).length;

    if (openCount <= closeCount) {
        return;
    }

    const lastChar = expression.slice(-1);

    if (
        lastChar === "(" ||
        isOperator(lastChar)
    ) {
        return;
    }

    expression += ")";
    render();
}

function pressTrig(func) {
    if (isErrorState()) {
        clearAll();
    }

    if (resetOnNextInput) {
        expression = "";
        resetOnNextInput = false;
    }

    let functionName = func;

    if (second) {
        if (func === "sin") {
            functionName = "asin";
        }

        if (func === "cos") {
            functionName = "acos";
        }

        if (func === "tan") {
            functionName = "atan";
        }
    }

    const lastChar = expression.slice(-1);

    if (isValueEnding(lastChar)) {
        expression += "×";
    }

    expression += `${functionName}(`;

    render();
}

function pressFunction(func) {
    if (isErrorState()) {
        clearAll();
    }

    if (resetOnNextInput) {
        expression = "";
        resetOnNextInput = false;
    }

    const lastChar = expression.slice(-1);

    if (isValueEnding(lastChar)) {
        expression += "×";
    }

    expression += `${func}(`;

    render();
}

function pressFactorial() {
    if (isErrorState()) {
        clearAll();
    }

    resetOnNextInput = false;

    if (expression === "") {
        return;
    }

    const lastChar = expression.slice(-1);

    if (/[0-9)π]/.test(lastChar)) {
        if (!expression.endsWith("!")) {
            expression += "!";
        }
    }

    render();
}

function backspace() {
    if (isErrorState() || resetOnNextInput) {
        clearAll();
        return;
    }

    const functionTokens = [
        "asin(",
        "acos(",
        "atan(",
        "sin(",
        "cos(",
        "tan(",
        "log(",
        "ln("
    ];

    for (const token of functionTokens) {
        if (expression.endsWith(token)) {
            expression =
                expression.slice(0, -token.length);

            render();
            return;
        }
    }

    expression =
        expression.slice(0, -1);

    render();
}

function toggleDegRad() {
    mode =
        mode === "DEG"
            ? "RAD"
            : "DEG";

    if (degRadBtn) {
        degRadBtn.innerText = mode;
    }
}

function toggleSecond() {
    second = !second;

    if (sinBtn) {
        sinBtn.innerText =
            second ? "sin⁻¹" : "sin";
    }

    if (cosBtn) {
        cosBtn.innerText =
            second ? "cos⁻¹" : "cos";
    }

    if (tanBtn) {
        tanBtn.innerText =
            second ? "tan⁻¹" : "tan";
    }
}

function prepareExpression(input) {
    let exp = input;

    exp = exp
        .replace(/×/g, "*")
        .replace(/÷/g, "/");

    exp = exp.replace(/%/g, "*0.01");

    exp = exp.replace(/π/g, "Math.PI");

    exp = exp
        .replace(/asin\(/g, "window.calcAsin(")
        .replace(/acos\(/g, "window.calcAcos(")
        .replace(/atan\(/g, "window.calcAtan(")
        .replace(/sin\(/g, "window.calcSin(")
        .replace(/cos\(/g, "window.calcCos(")
        .replace(/tan\(/g, "window.calcTan(")
        .replace(/log\(/g, "window.calcLog(")
        .replace(/ln\(/g, "window.calcLn(");

    let safety = 0;

    while (
        exp.includes("!") &&
        safety < 100
    ) {
        safety++;

        const factorialPattern =
            /(\((?:[^()]|\([^()]*\))*\)|Math\.PI|\d+(?:\.\d+)?)!/;

        const match =
            exp.match(factorialPattern);

        if (!match) {
            throw new Error("Invalid factorial");
        }

        const operand = match[1];

        exp = exp.replace(
            `${operand}!`,
            `window.calcFactorial(${operand})`
        );
    }

    exp = exp.replace(/\^/g, "**");

    exp = exp.replace(
        /(\d|\))\s*(?=\()/g,
        "$1*"
    );

    exp = exp.replace(
        /(\d|\))\s*(?=Math\.PI)/g,
        "$1*"
    );

    exp = exp.replace(
        /Math\.PI\s*(?=(\d|\())/g,
        "Math.PI*"
    );

    exp = exp.replace(
        /(\d|\))\s*(?=window\.calc(?:Sin|Cos|Tan|Asin|Acos|Atan|Ln|Log)\()/g,
        "$1*"
    );

    exp = exp.replace(
        /Math\.PI\s*(?=window\.calc(?:Sin|Cos|Tan|Asin|Acos|Atan|Ln|Log)\()/g,
        "Math.PI*"
    );

    return exp;
}

function balanceParentheses(exp) {
    const openCount =
        (exp.match(/\(/g) || []).length;

    const closeCount =
        (exp.match(/\)/g) || []).length;

    if (closeCount > openCount) {
        throw new Error("Unbalanced parentheses");
    }

    if (openCount > closeCount) {
        exp += ")".repeat(
            openCount - closeCount
        );
    }

    return exp;
}

function validateExpression(exp) {
    if (!exp.trim()) {
        throw new Error("Empty expression");
    }

    const allowedPattern =
        /^[0-9+\-*/().,\sA-Za-z_]+$/;

    if (!allowedPattern.test(exp)) {
        throw new Error("Invalid characters");
    }

    if (
        /(?:\*{3,}|\/{2,}|\+{2,}|-{3,})/.test(exp)
    ) {
        throw new Error("Invalid operators");
    }
}

function hasDivisionByZero(exp) {
    return /\/\s*0(?:\s*\)|\s*$)/.test(exp);
}

function formatResult(result) {
    if (result === Infinity) {
        return "Infinity";
    }

    if (result === -Infinity) {
        return "-Infinity";
    }

    if (Number.isNaN(result)) {
        return "Undefined";
    }

    if (!Number.isFinite(result)) {
        return "Undefined";
    }

    const rounded =
        Number(result.toPrecision(12));

    if (Object.is(rounded, -0)) {
        return "0";
    }

    return String(rounded);
}

function calculate() {
    if (
        !expression ||
        expression === "Error" ||
        expression === "Undefined"
    ) {
        return;
    }

    try {
        let exp = expression;

        const lastChar =
            exp.slice(-1);

        if (isOperator(lastChar)) {
            exp =
                exp.slice(0, -1);

            if (
                exp === "" ||
                exp === "-"
            ) {
                expression = "0";
                resetOnNextInput = true;
                render();
                return;
            }
        }

        exp =
            prepareExpression(exp);

        exp =
            balanceParentheses(exp);

        validateExpression(exp);

        if (hasDivisionByZero(exp)) {
            expression = "Undefined";
            render();
            resetOnNextInput = true;
            return;
        }

        const result =
            Function(
                `"use strict"; return (${exp});`
            )();

        expression =
            formatResult(result);

        render();

        resetOnNextInput = true;

    } catch (error) {
        console.error(
            "Calculator error:",
            error
        );

        expression = "Error";
        render();
        resetOnNextInput = true;
    }
}

document.addEventListener(
    "keydown",
    function (event) {

        const key = event.key;

        if (/^[0-9]$/.test(key)) {
            press(key);
            return;
        }

        if (key === ".") {
            pressDot();
            return;
        }

        if (key === "+") {
            press("+");
            return;
        }

        if (key === "-") {
            press("-");
            return;
        }

        if (key === "*") {
            press("×");
            return;
        }

        if (key === "/") {
            event.preventDefault();
            press("÷");
            return;
        }

        if (key === "^") {
            press("^");
            return;
        }

        if (key === "(") {
            pressOpenParen();
            return;
        }

        if (key === ")") {
            pressCloseParen();
            return;
        }

        if (
            key === "Enter" ||
            key === "="
        ) {
            event.preventDefault();
            calculate();
            return;
        }

        if (key === "Backspace") {
            backspace();
            return;
        }

        if (
            key === "Escape" ||
            key === "Delete"
        ) {
            clearAll();
        }
    }
);

if (degRadBtn) {
    degRadBtn.innerText = "DEG";
}

render();
