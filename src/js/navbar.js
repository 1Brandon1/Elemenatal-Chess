const themeMap = {
	dark: 'light',
	light: 'earth',
	earth: 'fire',
	fire: 'water',
	water: 'air',
	air: 'dark'
}

// Retrieve current theme from localStorage or set default
let currentTheme = localStorage.getItem('theme') || Object.keys(themeMap)[0]
if (!themeMap.hasOwnProperty(currentTheme)) {
	console.error('Invalid theme stored in localStorage.')
	currentTheme = Object.keys(themeMap)[0]
}

// Get body class list and apply current theme
const bodyClass = document.body.classList
bodyClass.add(currentTheme)

// Add event listener to theme button
document.getElementById('themeButton').addEventListener('click', toggleTheme)

//!-------------- Theme Management --------------

// Toggle theme between dark, light, earth, fire, water, and air
function toggleTheme() {
	const current = localStorage.getItem('theme') || Object.keys(themeMap)[0]
	const next = themeMap[current]
	if (!next) {
		console.error('Invalid theme found in localStorage:', current)
		return
	}
	bodyClass.replace(current, next)
	localStorage.setItem('theme', next)
}
