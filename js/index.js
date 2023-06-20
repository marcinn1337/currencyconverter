// VARS
let rate, clickedBtn
const amountInputs = document.querySelectorAll('.app__input')
const currencySearchInput = document.querySelector('.app__currencies-search')
const closeListBtn = document.querySelector('.app__currencies-close-btn')
const pickCurrencyBtns = document.querySelectorAll('.app__pick-currency-btn')
const swapBtn = document.querySelector('.app__swap-btn')
const infoBtn = document.querySelector('.app__info-btn')

// FUNCTIONS
async function getCurrencies() {
	const URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.json'
	const response = await axios.get(URL)
	const currencies = await response.data
	addCurrenciesToList(currencies)
}
const addCurrenciesToList = currencies => {
	const currencyList = document.querySelector('.app__currencies-list')
	for (const currency in currencies) {
		if (currencies[currency] == '') continue

		const currencyListItem = document.createElement('li')
		const currencyCodeSpan = document.createElement('span')
		const currencyNameSpan = document.createElement('span')

		currencyCodeSpan.textContent = currency
		currencyNameSpan.textContent = ` - ${currencies[currency]}`

		currencyListItem.classList.add('app__currency', 'hidden')
		currencyCodeSpan.classList.add('app__currency-code')
		currencyNameSpan.classList.add('app__currency-name')

		currencyListItem.append(currencyCodeSpan, currencyNameSpan)
		currencyList.appendChild(currencyListItem)
	}
}
const toggleCurrencyList = e => {
	const currenciesSearchSection = document.querySelector('.app__currencies')
	// If user want to close the list: wipe clickedBtn, search input, amount inputs and apply closing animation class.
	if (e == undefined || e.target === closeListBtn) {
		clickedBtn = null
		currencySearchInput.value = ''
		amountInputs.forEach(input => (input.value = ''))
		currenciesSearchSection.classList.remove('list-animation')
		filterCurrencies()
		setTimeout(() => {
			currenciesSearchSection.style.display = 'none'
			currenciesSearchSection.classList.remove('list-animation')
		}, 250)
		return
	}

	// If user want to open list
	currenciesSearchSection.style.display = 'block'
	setTimeout(() => {
		currenciesSearchSection.classList.add('list-animation')
	}, 20)

	e.target.classList.value.includes('first-btn') ? (clickedBtn = 'firstBtn') : (clickedBtn = 'secondBtn')
}
const filterCurrencies = e => {
	const currencyListItems = document.querySelectorAll('.app__currency')

	currencyListItems.forEach(currencyListItem => {
		const currencyCode = currencyListItem.querySelector('.app__currency-code').textContent
		if (e == undefined) {
			// Hide all visible currencies after closing list.
			currencyListItem.classList.add('hidden')
		} else if (currencySearchInput.value == '') {
			// Hide currency and remove listener if search input is empty
			currencyListItem.classList.add('hidden')
			currencyListItem.removeEventListener('click', assignCurrencyToBtn)
		} else if (currencyCode.includes(currencySearchInput.value.toLowerCase())) {
			// Show currencies whose code contains characters from search input
			currencyListItem.classList.remove('hidden')
			currencyListItem.addEventListener('click', assignCurrencyToBtn)
		} else {
			currencyListItem.classList.add('hidden')
			currencyListItem.removeEventListener('click', assignCurrencyToBtn)
		}
	})
}
const assignCurrencyToBtn = e => {
	const currencyCode = e.target.querySelector('.app__currency-code').textContent

	// Check what BTN was pressed before opening list. Then assign currency code to that button and fetch exchange rate from API.
	if (clickedBtn === 'firstBtn') {
		pickCurrencyBtns[0].textContent = currencyCode
		firstCurrency = currencyCode
	} else {
		pickCurrencyBtns[1].textContent = currencyCode
		secondCurrency = currencyCode
	}

	getExchangeRate(pickCurrencyBtns[0].textContent, pickCurrencyBtns[1].textContent)
	toggleCurrencyList()
}
async function getExchangeRate(firstCurrency, secondCurrency) {
	const URL_HEAD = 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/'
	const URL = `${URL_HEAD}${firstCurrency}/${secondCurrency}.json`
	const response = await axios.get(URL)
	rate = await response.data[secondCurrency]
}
const convertCurrency = e => {
	const amount = e.target.value

	e.target.classList.value.includes('first-input')
		? (amountInputs[1].value = (rate * amount).toFixed(2))
		: (amountInputs[0].value = (amount / rate).toFixed(2))
}
const swapCurrencies = () => {
	// Swap input labels
	;[pickCurrencyBtns[0].textContent, pickCurrencyBtns[1].textContent] = [
		pickCurrencyBtns[1].textContent,
		pickCurrencyBtns[0].textContent
	]

	// Swap input values
	;[amountInputs[0].value, amountInputs[1].value] = [amountInputs[1].value, amountInputs[0].value]

	// New rate after swapping pair
	rate = Number((1 / rate).toFixed(6))
}
const toggleInfoSection = () => {
	const infoSection = document.querySelector('.app__info')
	const converterWrapper = document.querySelector('.wrapper')

	infoSection.classList.toggle('info-slide')
	converterWrapper.classList.toggle('converter-slide')
}

// Init rate for default pair (eur to pln) and fetch list of available currencies which API provide
getCurrencies()
getExchangeRate('eur', 'pln')

// EVENT LISTENERS
currencySearchInput.addEventListener('input', filterCurrencies)
closeListBtn.addEventListener('click', toggleCurrencyList)
swapBtn.addEventListener('click', swapCurrencies)
infoBtn.addEventListener('click', toggleInfoSection)
pickCurrencyBtns.forEach(btn => btn.addEventListener('click', toggleCurrencyList))
amountInputs.forEach(input => input.addEventListener('keyup', convertCurrency))
