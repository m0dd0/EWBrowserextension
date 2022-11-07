var tlmToggleWrapper = document.querySelector('.tlm__status')
var tlmToggleButton = document.querySelector('.tlm__status-toggle')

var tlmRefreshPanel = document.querySelector('.tlm__refresh-panel')
var tlmRefreshPanelButtonRefresh = tlmRefreshPanel.querySelector('.tlm__refresh-panel-button.refresh')
var tlmRefreshPanelButtonNotNow = tlmRefreshPanel.querySelector('.tlm__refresh-panel-button.not-now')

var tlmStatusEnabled = true

function init() {
  tlmToggleButton.addEventListener('click', () => {
    tlmToggleWrapper.classList.add('transitioning')
    toggleStatus()
    setTimeout(() => {
      tlmToggleWrapper.classList.remove('transitioning')
    }, 400)
  })

  initRefreshPanel()

  chrome.storage.sync.get(['theLaendmakerEnabled'], (result) => {
    tlmStatusEnabled = result.theLaendmakerEnabled
    updateToggleButton()
    updateExtIcon()
  })
}

function toggleStatus() {
  chrome.storage.sync.set({ theLaendmakerEnabled: !tlmStatusEnabled }, () => {
    tlmStatusEnabled = !tlmStatusEnabled
    updateToggleButton()
    updateExtIcon()
    showRefreshPanel()
  })
}

function updateToggleButton() {
  tlmToggleButton.setAttribute('data-enabled', tlmStatusEnabled)
  tlmToggleButton.innerHTML = tlmStatusEnabled ? 'on' : 'off'
}

function initRefreshPanel() {
  tlmRefreshPanel.querySelector('.tlm__refresh-panel-text').innerHTML = chrome.i18n.getMessage('refreshPanelText')

  tlmRefreshPanelButtonNotNow.innerHTML = chrome.i18n.getMessage('refreshPanelButtonNotNow')
  tlmRefreshPanelButtonNotNow.addEventListener('click', hideRefreshPanel)

  tlmRefreshPanelButtonRefresh.innerHTML = chrome.i18n.getMessage('refreshPanelButtonRefresh')
  tlmRefreshPanelButtonRefresh.addEventListener('click', refreshActiveTab)
}

function showRefreshPanel() {
  tlmRefreshPanel.classList.add('visible')
}
function hideRefreshPanel() {
  tlmRefreshPanel.classList.remove('visible')
  setTimeout(() => {
    window.close()
  }, 500)
}

function refreshActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (current) => {
    chrome.tabs.reload(current[0].tabId)
    window.close()
  })
}

function updateExtIcon() {
  if (tlmStatusEnabled) {
    chrome.action.setIcon({
      path: {
        16: 'images/icon16.png',
        24: 'images/icon24.png',
        32: 'images/icon32.png',
        48: 'images/icon48.png',
        128: 'images/icon128.png',
      },
    })
  } else {
    chrome.action.setIcon({
      path: {
        16: 'images/icon16-inactive.png',
        24: 'images/icon24-inactive.png',
        32: 'images/icon32-inactive.png',
        48: 'images/icon48-inactive.png',
        128: 'images/icon128-inactive.png',
      },
    })
  }
}

init()
