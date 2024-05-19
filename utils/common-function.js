const { toWords } = require('number-to-words');

function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

function indianNumberFormat(num) {
    const under1000 = num % 1000;
    const thousands = Math.floor((num % 100000) / 1000);
    const lakhs = Math.floor(num / 100000);
    let result = '';

    if (lakhs > 0) {
        result += toWords(lakhs) + ' Lakh' + (lakhs > 1 ? 's' : '');
    }
    if (thousands > 0) {
        if (result.length > 0) result += ' ';
        result += toWords(thousands) + ' Thousand';
    }
    if (under1000 > 0) {
        if (result.length > 0) result += ' ';
        result += toWords(under1000);
    }

    return result;
}

function convertCurrencyToWords(amount) {
    let rupees = Math.floor(amount);
    let paise = Math.round((amount - rupees) * 100);
    let words = '';

    if (rupees > 0) {
        words += `${capitalizeWords(indianNumberFormat(rupees))} Rupee${rupees > 1 ? 's' : ''}`;
    }
    if (paise > 0) {
        if (words !== '') {
            words += ' and ';
        }
        words += `${capitalizeWords(toWords(paise))} Paise`;
    }
    return words || 'Zero Rupees';
}

function getWord(num) {
    if (!num) return "";
    var ones = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
    var tens = ["", "", "Twenty ", "Thirty ", "Forty ", "Fifty ", "Sixty ", "Seventy ", "Eighty ", "Ninety "];

    if ((num = num.toString()).length > 9) return "Overflow: Maximum 9 digits supported";
    // Padding the number to ensure it is 9 digits long
    num = ("000000000" + num).substr(-9);

    // Splitting the number into Crores, Lakhs, Thousands, Hundreds, and the last two digits
    var n = num.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return "";

    var str = "";
    str += n[1] != "00" ? (ones[Number(n[1])] || tens[n[1][0]] + ones[n[1][1]]) + "Crore" + (Number(n[1]) > 1 ? "s " : " ") : "";
    str += n[2] != "00" ? (ones[Number(n[2])] || tens[n[2][0]] + ones[n[2][1]]) + "Lakh" + (Number(n[2]) > 1 ? "s " : " ") : "";
    str += n[3] != "00" ? (ones[Number(n[3])] || tens[n[3][0]] + ones[n[3][1]]) + "Thousand" + (Number(n[3]) > 1 ? "s " : " ") : "";
    str += n[4] != "0" ? (ones[Number(n[4])] || tens[n[4][0]] + ones[n[4][1]]) + "Hundred" + (Number(n[4]) > 1 ? "s " : " ") : "";
    var lastTwo = Number(n[5]);
    str += lastTwo != 0 ? (str != "" ? "and " : "") + (ones[lastTwo] || tens[n[5][0]] + ones[n[5][1]]) : "";

    return str.trim();
}

function convertNumberToWords(num) {
    let numString = num.toString()
    const [integerPart, decimalPart] = numString.split('.');
    const main = getWord(integerPart)
    let paise = Math.round((num - parseInt(integerPart)) * 100);

    const decimal = getWord(paise.toString())
    let words = '';

    if (main) {
        words += `${main} Rupee${integerPart > 1 ? 's' : ''}`;
    }
    if (decimal) {
        if (words !== '') {
            words += ' and ';
        }
        words += `${decimal} Paise`;
    }
    return words || 'Zero Rupees';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    let day = '' + date.getDate();
    let month = '' + (date.getMonth() + 1); // Months are 0-based
    const year = date.getFullYear();

    // Add leading 0 to single-digit days and months
    if (day.length < 2) day = '0' + day;
    if (month.length < 2) month = '0' + month;

    return [day, month, year].join('/');
}

module.exports = {
    convertNumberToWords,
    formatDate,
    convertCurrencyToWords
}