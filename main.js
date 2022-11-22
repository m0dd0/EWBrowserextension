const bannedtags = ['STYLE', 'SCRIPT', 'NOSCRIPT', 'TEXTAREA', 'INPUT']
const theMatches = [
  { key: 'das land baden-württemberg', val: 'THE LÄND' },
  { key: 'im land baden-württemberg', val: 'in THE LÄND' },
  { key: 'land baden-württemberg', val: 'THE LÄND' },
  { key: 'baden-württemberg', val: 'THE LÄND' },
  { key: 'baden - württemberg', val: 'THE LÄND' },
  { key: 'baden-würtemberg', val: 'THE LÄND' },
  { key: 'baden württemberg', val: 'THE LÄND' },
  { key: 'baden würtemberg', val: 'THE LÄND' },
  { key: '#badenwürttemberg', val: '#theländ' },
  { key: '#badenwuerttemberg', val: '#theländ' },
  { key: 'baden-wuerttemberg', val: 'the-länd' },
]

const handleEdgeCases = (node) => {
  // GOOGLE SEARCH RESULTS
  // Google displays matches in descriptions as bold, by wrapping them in <em>Word</em>-<em>Word</em>
  // "hard coded" removal of sibling elements and wrapping the replacement in a single <em>
  if (node.textContent === 'Baden' && node.nextSibling && node.nextSibling.textContent === '-' && node.nextElementSibling.textContent == 'Württemberg') {
    node.nextSibling.remove()
    node.nextElementSibling.remove()
    node.textContent = 'THE LÄND'
    node.isReplaced = true
  }
}

const replaceBWString = (content) => {
  theMatches.forEach((item) => {
    const key = new RegExp('(' + item.key + ')', 'gi')
    content = content.replaceAll(key, item.val)
  })
  return content
}

const replaceElements = (node) => {
  if (!node || bannedtags.includes(node.tagName) || isContentEditable(node)) return

  handleEdgeCases(node)

  node.childNodes?.forEach((n) => {
    if (n.isReplaced || n.nodeType != Node.TEXT_NODE) return
    n.textContent = replaceBWString(n.textContent)
    n.isReplaced = true
    return
  })
}

const isContentEditable = (elem) => {
  if (elem.attributes && elem.attributes.getNamedItem('contenteditable')) return true
  if (elem.parentNode && elem.parentNode.attributes && elem.parentNode.attributes.getNamedItem('contenteditable')) return true
  return false
}

const processMutations = (mutationsList) => {
  for (const mutation of mutationsList) {
    switch (mutation.type) {
      case 'childList':
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType == Node.ELEMENT_NODE) replaceElements(node.querySelectorAll('*'))
        })
        break
      case 'characterData':
        if (isContentEditable(mutation.target)) return
        replaceElements(mutation.target)
        break
    }
  }
}

const main = () => {
  // INITALLY RUN REPLACEMENTS
  // on page title and DOM elements
  document.title = replaceBWString(document.title)
  document.querySelectorAll('body *').forEach((node) => {
    replaceElements(node)
  })

  // OBSERVE MUTATIONS
  // e.g. for replacing lazy loaded content
  new MutationObserver(processMutations).observe(document.querySelector('body'), { childList: true, subtree: true, characterData: true })
}

// entry point for the code injected to the page
chrome.storage.sync.get(['theLaendmakerEnabled'], (result) => {
  if (result.theLaendmakerEnabled) main()
})
