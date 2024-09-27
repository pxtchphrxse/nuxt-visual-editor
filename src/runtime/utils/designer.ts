import { nextTick, type Reactive } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import tailwindColors from './tailwaind-colors'
import tailwindOpacities from './tailwind-opacities'
import tailwindFontSizes from './tailwind-font-sizes'
import tailwindFontStyles from './tailwind-font-styles'
import tailwindPaddingAndMargin from './tailwind-padding-margin'
import tailwindBorderRadius from './tailwind-border-radius'
import tailwindBorderStyleWidthPlusColor from './tailwind-border-style-width-color'

export interface Component {
  id: string
  name: string
  category: string
  imageSrc: string
  html: string
}

export interface Image {
  file: string | null
}

export interface DesignerState {
  menuPreview: boolean
  menuLeft: boolean
  menuRight: boolean
  borderStyle: string | null
  borderWidth: string | null
  borderColor: string | null
  borderRadiusGlobal: string | null
  borderRadiusTopLeft: string | null
  borderRadiusTopRight: string | null
  borderRadiusBottomleft: string | null
  borderRadiusBottomRight: string | null
  elementContainsHyperlink: boolean
  hyperlinkAbility: boolean
  hyperlinkInput: string | null
  hyperlinkMessage: string | null
  hyperlinkError: string | null
  hyberlinkEnable: boolean
  openHyperlinkinkInNewTab: boolean | null
  opacity: string | null
  backgroundOpacity: string | null
  textAreaVueModel: string | null
  nextSibling: ChildNode | null
  parentElement: ParentNode | null
  restoredElement: string | null
  currentClasses: string[]
  fontVerticalPadding: string | null
  fontHorizontalPadding: string | null
  fontVerticalMargin: string | null
  fontHorizontalMargin: string | null
  fontStyle: string | null
  fontFamily: string | null
  fontWeight: string | null
  fontBase: string | null
  fontDesktop: string | null
  fontTablet: string | null
  fontMobile: string | null
  enabledCustomColorBackground: boolean | null
  backgroundColorCustom: string | null
  backgroundColor: string | null
  enabledCustomColorText: boolean | null
  textColorCustom: string | null
  textColor: string | null
  element: HTMLElement | null
  component: Component | null
  components: Component[]
  basePrimaryImage: string | null
  highlightedImage: Image | null
  fetchedComponents: { isLoading: boolean, isError: boolean, components: Component[] }
  preview: string
  showPreview: boolean
}

type modifyElementCSS = keyof Pick<DesignerState, 'fontWeight' | 'fontFamily' | 'fontStyle' | 'fontVerticalPadding' | 'fontHorizontalPadding' | 'borderStyle' | 'borderWidth' | 'borderColor' | 'borderRadiusGlobal' | 'borderRadiusTopLeft' | 'borderRadiusTopRight' | 'borderRadiusBottomleft' | 'borderRadiusBottomRight' | 'backgroundColor' | 'textColor' | 'backgroundOpacity' | 'opacity' | 'fontVerticalMargin' | 'fontHorizontalMargin'>

export class Designer {
  elementsWithListeners
  nextTick
  timer: number | null
  backgroundColors
  textColors
  observer: MutationObserver | undefined
  textContentVueModel: string | undefined

  constructor(private store: Reactive<DesignerState>) {
    /**
     * Initialize an instance variable 'elementsWithListeners' as a WeakSet.
     *
     * A WeakSet is a special type of Set that holds weak references to its elements,
     * meaning that an element could be garbage collected if there is no other reference to it.
     * This is especially useful in the context of managing DOM elements and their associated events,
     * as it allows for efficient and automated cleanup of references to DOM elements that have been removed.
     *
     * By checking if an element is in this WeakSet before attaching an event listener,
     * we can prevent redundant addition of the same event listener to an element.
     * This helps in managing the memory usage and performance of the application.
     */
    this.elementsWithListeners = new WeakSet()
    this.nextTick = nextTick

    this.timer = null
    this.backgroundColors = tailwindColors.backgroundColors()
    this.textColors = tailwindColors.textColors()
  }

  handleAddClasses(userSelectedClass: string) {
    if (
      typeof userSelectedClass === 'string'
      && userSelectedClass !== ''
      && !userSelectedClass.includes(' ')
      // Check if class already exists
      && !this.store.element?.classList.contains(userSelectedClass)
    ) {
      this.store.element?.classList.add(userSelectedClass)
      this.store.currentClasses.push(userSelectedClass)
    }
  }

  handleRemoveClasses(userSelectedClass: string) {
    // remove selected class from element
    if (this.store.element?.classList.contains(userSelectedClass)) {
      this.store.element.classList.remove(userSelectedClass)
      this.store.currentClasses = this.store.currentClasses.filter(cls => cls !== userSelectedClass)
    }
  }

  handleDeleteElement() {
    if (!this.store.element) return
    // Get the element to be deleted
    const element = this.store.element

    // Store the parent of the deleted element
    this.store.parentElement = element.parentNode
    // Store the outerHTML of the deleted element
    this.store.restoredElement = element.outerHTML
    // Store the next sibling of the deleted element
    this.store.nextSibling = element.nextSibling

    this.store.component = null
    this.store.element = null

    // Remove the element from the DOM
    element.remove()
  }

  handleRestoreElement() {
    // Get the stored deleted element and its parent
    if (
      this.store.restoredElement !== null
      && this.store.parentElement !== null
    ) {
      // Create a new element from the stored outerHTML
      const newElement = document.createElement('div')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(newElement as any).innerHTML = this.store.restoredElement

      // Append the restored element to its parent
      // Insert the restored element before its next sibling in its parent
      this.store.parentElement.insertBefore(newElement.firstChild!, this.store.nextSibling)
    }

    // Clear
    this.store.parentElement = null
    this.store.restoredElement = null
    this.store.component = null
    this.store.element = null
  }

  #modifyElementCSS(selectedCSS: string | undefined, CSSArray: string[], mutationName: modifyElementCSS) {
    if (this.store.element === null) {
      return
    }

    const currentCSS = CSSArray.find(CSS =>
      this.store.element!.classList.contains(CSS),
    )

    // set to 'none' if undefined
    let elementClass = currentCSS || 'none'

    this.store[mutationName] = elementClass

    if (typeof selectedCSS === 'string' && selectedCSS !== 'none') {
      if (
        elementClass
        && this.store.element.classList.contains(elementClass)
      ) {
        this.store.element.classList.remove(elementClass)
      }

      this.store.element.classList.add(selectedCSS)
      elementClass = selectedCSS
    }
    else if (
      typeof selectedCSS === 'string'
      && selectedCSS === 'none'
      && elementClass
    ) {
      this.store.element.classList.remove(elementClass)
      elementClass = selectedCSS
    }

    this.store[mutationName] = elementClass

    return currentCSS
  }

  handleFontWeight(userSelectedFontWeight?: string) {
    this.#modifyElementCSS(
      userSelectedFontWeight,
      tailwindFontStyles.fontWeight,
      'fontWeight',
    )
  }

  handleFontFamily(userSelectedFontFamily?: string) {
    this.#modifyElementCSS(
      userSelectedFontFamily,
      tailwindFontStyles.fontFamily,
      'fontFamily',
    )
  }

  handleFontStyle(userSelectedFontStyle?: string) {
    this.#modifyElementCSS(
      userSelectedFontStyle,
      tailwindFontStyles.fontStyle,
      'fontStyle',
    )
  }

  handleVerticalPadding(userSelectedVerticalPadding?: string) {
    this.#modifyElementCSS(
      userSelectedVerticalPadding,
      tailwindPaddingAndMargin.verticalPadding,
      'fontVerticalPadding',
    )
  }

  handleHorizontalPadding(userSelectedHorizontalPadding?: string) {
    this.#modifyElementCSS(
      userSelectedHorizontalPadding,
      tailwindPaddingAndMargin.horizontalPadding,
      'fontHorizontalPadding',
    )
  }

  handleVerticalMargin(userSelectedVerticalMargin?: string) {
    this.#modifyElementCSS(
      userSelectedVerticalMargin,
      tailwindPaddingAndMargin.verticalMargin,
      'fontVerticalMargin',
    )
  }

  handleHorizontalMargin(userSelectedHorizontalMargin?: string) {
    this.#modifyElementCSS(
      userSelectedHorizontalMargin,
      tailwindPaddingAndMargin.horizontalMargin,
      'fontHorizontalMargin',
    )
  }

  handleBorderStyle(borderStyle?: string) {
    this.#modifyElementCSS(
      borderStyle,
      tailwindBorderStyleWidthPlusColor.borderStyle,
      'borderStyle',
    )
  }

  handleBorderWidth(borderWidth?: string) {
    this.#modifyElementCSS(
      borderWidth,
      tailwindBorderStyleWidthPlusColor.borderWidth,
      'borderWidth',
    )
  }

  handleBorderColor(borderColor?: string) {
    this.#modifyElementCSS(
      borderColor,
      tailwindBorderStyleWidthPlusColor.borderColor,
      'borderColor',
    )
  }

  handleBorderRadiusGlobal(borderRadiusGlobal?: string) {
    this.#modifyElementCSS(
      borderRadiusGlobal,
      tailwindBorderRadius.roundedGlobal,
      'borderRadiusGlobal',
    )
  }

  handleBorderRadiusTopLeft(borderRadiusTopLeft?: string) {
    this.#modifyElementCSS(
      borderRadiusTopLeft,
      tailwindBorderRadius.roundedTopLeft,
      'borderRadiusTopLeft',
    )
  }

  handleBorderRadiusTopRight(borderRadiusTopRight?: string) {
    this.#modifyElementCSS(
      borderRadiusTopRight,
      tailwindBorderRadius.roundedTopRight,
      'borderRadiusTopRight',
    )
  }

  handleBorderRadiusBottomleft(borderRadiusBottomleft?: string) {
    this.#modifyElementCSS(
      borderRadiusBottomleft,
      tailwindBorderRadius.roundedBottomLeft,
      'borderRadiusBottomleft',
    )
  }

  handleBorderRadiusBottomRight(borderRadiusBottomRight?: string) {
    this.#modifyElementCSS(
      borderRadiusBottomRight,
      tailwindBorderRadius.roundedBottomRight,
      'borderRadiusBottomRight',
    )
  }

  handleFontSize(userSelectedFontSize?: string) {
    if (this.store.element === null) return
    let fontBase = tailwindFontSizes.fontBase.find((size) => {
      return this.store.element!.classList.contains(size)
    })

    if (fontBase === undefined) {
      fontBase = 'base:none'
    }

    let fontDesktop = tailwindFontSizes.fontDesktop.find((size) => {
      return this.store.element!.classList.contains(size)
    })
    if (fontDesktop === undefined) {
      fontDesktop = 'lg:none'
    }

    let fontTablet = tailwindFontSizes.fontTablet.find((size) => {
      return this.store.element!.classList.contains(size)
    })
    if (fontTablet === undefined) {
      fontTablet = 'md:none'
    }

    let fontMobile = tailwindFontSizes.fontMobile.find((size) => {
      return this.store.element!.classList.contains(size)
    })
    if (fontMobile === undefined) {
      fontMobile = 'sm:none'
    }

    // set fonts
    this.store.fontBase = fontBase
    this.store.fontDesktop = fontDesktop
    this.store.fontTablet = fontTablet
    this.store.fontMobile = fontMobile

    if (userSelectedFontSize !== undefined) {
      if (
        !userSelectedFontSize.includes('sm:')
        && !userSelectedFontSize.includes('md:')
        && !userSelectedFontSize.includes('lg:')
      ) {
        this.store.element!.classList.remove(fontBase)
        if (!userSelectedFontSize.includes('base:none')) {
          this.store.element!.classList.add(userSelectedFontSize)
        }
        this.store.fontBase = userSelectedFontSize
      }
      if (userSelectedFontSize.includes('lg:')) {
        this.store.element!.classList.remove(fontDesktop)
        if (!userSelectedFontSize.includes('lg:none')) {
          this.store.element!.classList.add(userSelectedFontSize)
        }
        this.store.fontDesktop = userSelectedFontSize
      }
      if (userSelectedFontSize.includes('md:')) {
        this.store.element!.classList.remove(fontTablet)
        if (!userSelectedFontSize.includes('md:none')) {
          this.store.element!.classList.add(userSelectedFontSize)
        }
        this.store.fontTablet = userSelectedFontSize
      }
      if (userSelectedFontSize.includes('sm:')) {
        this.store.element.classList.remove(fontMobile)
        if (!userSelectedFontSize.includes('sm:none')) {
          this.store.element.classList.add(userSelectedFontSize)
        }
        this.store.fontMobile = userSelectedFontSize
      }
    }
  }

  handleCustomBackgroundColor(userSelectedColor?: string, enabledCustomColor?: boolean) {
    if (this.store.element === null) return
    // if user is selecting a custom HEX color
    if (userSelectedColor === undefined && enabledCustomColor === undefined) {
      // Get the style property
      const bgColor = this.store.element.style.backgroundColor

      // Check for inline background color
      if (typeof bgColor === 'string' && bgColor.length !== 0) {
        this.store.enabledCustomColorBackground = true
        this.store.backgroundColorCustom = bgColor
      }

      // Check for inline background color
      if (typeof bgColor === 'string' && bgColor.length === 0) {
        this.store.enabledCustomColorBackground = false
        this.store.backgroundColorCustom = null
      }
    }

    // if user is selecting a custom HEX color
    if (enabledCustomColor === true && userSelectedColor) {
      this.store.element.style.backgroundColor = userSelectedColor
    }
  }

  handleCustomTextColor(userSelectedColor?: string, enabledCustomColor?: boolean) {
    if (this.store.element === null) return
    // if user is selecting a custom HEX color
    if (userSelectedColor === undefined && enabledCustomColor === undefined) {
      // Get the style property
      const textColor = this.store.element.style.color

      // Check for inline background color
      if (typeof textColor === 'string' && textColor.length !== 0) {
        this.store.enabledCustomColorText = true
        this.store.textColorCustom = textColor
      }

      // Check for inline background color
      if (typeof textColor === 'string' && textColor.length === 0) {
        this.store.enabledCustomColorText = true
        this.store.textColorCustom = null
      }
    }

    // if user is selecting a custom HEX color
    if (enabledCustomColor === true && userSelectedColor) {
      this.store.element.style.color = userSelectedColor
    }
  }

  currentClasses() {
    if (!this.store.element) return
    // convert classList to array
    const classListArray = Array.from(this.store.element.classList)

    // commit array to store
    this.store.currentClasses = classListArray
  }

  handleBackgroundColor(userSelectedColor?: string) {
    this.#modifyElementCSS(
      userSelectedColor,
      this.backgroundColors,
      'backgroundColor',
    )
  }

  handleTextColor(userSelectedColor?: string) {
    this.#modifyElementCSS(userSelectedColor, this.textColors, 'textColor')
  }

  removeCustomColorBackground() {
    this.store.element?.style.removeProperty('background-color')
    this.store.enabledCustomColorBackground = null
    this.store.backgroundColorCustom = null
  }

  removeCustomColorText() {
    this.store.element?.style.removeProperty('color')
    this.store.enabledCustomColorText = null
    this.store.textColorCustom = null
  }

  handleBackgroundOpacity(opacity?: string) {
    this.#modifyElementCSS(
      opacity,
      tailwindOpacities.backgroundOpacities,
      'backgroundOpacity',
    )
  }

  handleOpacity(opacity?: string) {
    this.#modifyElementCSS(opacity, tailwindOpacities.opacities, 'opacity')
  }

  /**
   * The attachElementListeners function is adding mouseover
   * and click event listeners to a specific DOM element
   *
   */
  attachElementListeners = (element: Element) => {
    // Only run on mouse over
    element.addEventListener('mouseover', (e) => {
      e.stopPropagation()

      if (document.querySelector('[hovered]') !== null) {
        document.querySelector('[hovered]')?.removeAttribute('hovered')
      }

      element.setAttribute('hovered', '')
    })

    // Only run on mouse leave
    element.addEventListener('mouseleave', (e) => {
      e.stopPropagation()

      if (document.querySelector('[hovered]') !== null) {
        document.querySelector('[hovered]')?.removeAttribute('hovered')
      }
    })

    // Only run during on mouse click
    element.addEventListener('click', (e) => {
      this.store.menuRight = true

      e.preventDefault()
      e.stopPropagation()

      if (document.querySelector('[selected]') !== null) {
        document.querySelector('[selected]')?.removeAttribute('selected')
      }

      (e.currentTarget as HTMLElement)?.removeAttribute('hovered')
      ;(e.currentTarget as HTMLElement)?.setAttribute('selected', '')

      this.store.element = e.currentTarget as HTMLElement
      if (this.store.element === null) return

      this.handleDesignerMethods()
    })
  }

  /**
   * The addClickAndHoverEvents function is used to
   * attach event listeners to each element within a 'section'
   *
   */
  addClickAndHoverEvents = () => {
    document.querySelectorAll('.visual-editor section *').forEach((element) => {
      if (
        this.elementsWithListeners
        && this.elementsWithListeners.has(element) === false
      ) {
        this.elementsWithListeners.add(element)
        this.attachElementListeners(element)
      }
    })
  }

  removeHoveredAndSelected() {
    if (document.querySelector('[hovered]') !== null) {
      document.querySelector('[hovered]')!.removeAttribute('hovered')
    }

    if (document.querySelector('[selected]') !== null) {
      document.querySelector('[selected]')!.removeAttribute('selected')
    }
  }

  saveCurrentDesignWithTimer = () => {
    this.nextTick(this.previewCurrentDesign)
    setTimeout(() => {
      this.observePlusSyncHTMLElements()
    }, 250)
  }

  observePlusSyncHTMLElements = async () => {
    if (document.querySelector('[hovered]') !== null) {
      document.querySelector('[hovered]')!.removeAttribute('hovered')
    }

    this.addClickAndHoverEvents()
    this.store.components.forEach((component) => {
      const section = document.querySelector(
        `section[data-componentid="${component.id}"]`,
      )

      if (section) {
        component.html = section.outerHTML
      }
    })

    // Initialize the MutationObserver
    this.observer = new MutationObserver((_, observer) => {
      // Once we have seen a mutation, stop observing and resolve the promise
      observer.disconnect()
    })

    // Start observing the document with the configured parameters
    this.observer.observe(document, {
      attributes: true,
      childList: true,
      subtree: true,
    })

    // Use the MutationObserver to wait for the next DOM change
    await new Promise((resolve) => {
      resolve(null)
    })

    // This will be executed after the DOM has been updated
    this.store.element = document.querySelector('[selected]')
    this.addClickAndHoverEvents()
  }

  cloneCompObjForDOMInsertion(componentObject: Component) {
    // Hide slider and right menu
    this.store.menuPreview = false
    this.store.menuRight = false

    // Deep clone clone component
    const clonedComponent = { ...componentObject }

    // Create a DOMParser instance
    const parser = new DOMParser()

    // Parse the HTML content of the clonedComponent using the DOMParser
    const doc = parser.parseFromString(clonedComponent.html, 'text/html')

    // Add the component id to the section element
    const section = doc.querySelector('section')
    if (section) {
      // Generate a unique ID using uuidv4() and assign it to the section
      section.dataset.componentid = uuidv4()
    }

    // Update the clonedComponent id with the newly generated unique ID
    clonedComponent.id = section!.dataset.componentid!

    // Update the HTML content of the clonedComponent with the modified HTML
    clonedComponent.html = doc.querySelector('section')!.outerHTML

    // return to the cloned element to be dropped
    return clonedComponent
  }

  deleteAllComponents() {
    this.store.components = []
  }

  getCurrentIndex(event: Event) {
    // Declare container of components and current event
    const allComponents = document.querySelector('#pagebuilder')!.children
    const currentComponent = (event.target as HTMLElement).closest('div[data-draggable="true"]')
    // Get index of chosen event
    const currentIndex = Array.from(allComponents).indexOf(currentComponent!)
    return currentIndex
  }

  deleteComponent(event: Event) {
    const currentIndex = this.getCurrentIndex(event)
    // remove component from array
    this.store.components.splice(currentIndex, 1)
  }

  moveComponent(event: Event, dir: number) {
    // Get index of component
    const currentIndex = this.getCurrentIndex(event)
    // Return if moving first component backwards or last component forwards
    if (
      (currentIndex === 0 && dir === -1)
      || (currentIndex === this.store.components.length - 1 && dir === 1)
    )
      return

    const currentComponent = this.store.components[currentIndex]
    // Remove current object
    // Move it forwards if negative dir or forward if positive dir
    this.store.components.splice(currentIndex, 1)
    this.store.components.splice(
      currentIndex + 1 * dir,
      0,
      currentComponent,
    )
    // Follow component to new location
    document
      .querySelector('#pagebuilder')!
      .children[currentIndex + 1 * dir].scrollIntoView({ behavior: 'smooth' })
    // end of method "moveComponent"
  }

  handleTextAreaContent() {
    const element = this.store.element
    if (!element) return
    const elementTag = element.tagName.toLowerCase()

    // text content
    if (typeof element.innerHTML !== 'string') {
      return
    }

    if (typeof element.innerHTML === 'string') {
      const textContentElementClone
        = element.innerHTML.replaceAll('<br>', '\r\n') || ''

      this.store.textAreaVueModel = textContentElementClone
    }

    if (
      ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(elementTag)
      && element.tagName.toLowerCase() !== 'img'
      && Number(element.textContent?.length) === 0
    ) {
      element.classList.add('h-7')
      element.classList.add('min-h-[7]')
      element.classList.add('bg-red-50')
    }
    if (
      ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(elementTag)
      && element.tagName.toLowerCase() !== 'img'
      && Number(element.textContent?.length) !== 0
    ) {
      element.classList.remove('h-7')
      element.classList.remove('min-h-[7]')
      element.classList.remove('bg-red-50')
    }
  }

  decodeHTML(html: string) {
    const txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  async changeText(event: Event) {
    const text = (event.target as HTMLInputElement).value

    // Convert newline characters to <br> tags when saving
    const textContentWithBr = text.replaceAll(
      /\r?\n/g,
      '<br>',
    )

    // Update both the displayed content and the model
    this.textContentVueModel = textContentWithBr
    this.store.textAreaVueModel = textContentWithBr.replaceAll('<br>', '\r\n')
    this.store.element!.innerHTML = textContentWithBr
  }

  previewCurrentDesign() {
    // this.store.component = null
    // this.store.element = null

    const addedHtmlComponents: string[] = []
    // iterate over each top-level section component
    document
      .querySelectorAll('.visual-editor section')
      .forEach((section) => {
        // remove hovered and selected

        // remove hovered
        if (section.querySelector('[hovered]') !== null) {
          section.querySelector('[hovered]')!.removeAttribute('hovered')
        }

        // remove selected
        const selected = section.querySelector('[selected]')
        if (selected !== null) {
          section.querySelector('[selected]')!.removeAttribute('selected')
        }

        // push outer html into the array
        if (section.hasAttribute('data-componentid')) {
          addedHtmlComponents.push(section.outerHTML)
        }

        // reselect
        if (selected !== null) {
          selected.setAttribute('selected', '')
        }
      })

    this.store.preview = addedHtmlComponents.join(' ')
  }

  parseComponents(html: string) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const components: Component[] = []
    doc.querySelectorAll('section').forEach((section) => {
      const id = section.getAttribute('data-componentid')
      if (!id) return
      components.push({ id, html: section.outerHTML, name: '', imageSrc: '', category: '' })
    })
    this.store.components = components
  }

  updateBasePrimaryImage() {
    if (
      this.store.highlightedImage
      && this.store.highlightedImage.file !== null
    ) {
      this.handleDesignerMethods()
      this.store.basePrimaryImage = this.store.highlightedImage.file
      ;(this.store.element as HTMLImageElement).src = this.store.highlightedImage.file
    }
  }

  showBasePrimaryImage() {
    const currentImageContainer = document.createElement('div')
    currentImageContainer.innerHTML = this.store.element!.outerHTML

    // Get all img and div within the current image container
    const imgElements = currentImageContainer.getElementsByTagName('img')
    const divElements = currentImageContainer.getElementsByTagName('div')

    // Check if there is exactly one img and no div
    if (imgElements.length === 1 && divElements.length === 0) {
      // Return the source of the only img

      this.store.basePrimaryImage = imgElements[0].src
      return
    }
    this.store.basePrimaryImage = null
  }

  #addHyperlinkToElement(hyperlinkEnable?: boolean, urlInput?: string, openHyperlinkInNewTab?: boolean) {
    const parentHyperlink = this.store.element!.closest('a')
    const hyperlink = this.store.element!.querySelector('a')

    this.store.hyperlinkError = null

    // url validation
    const urlRegex
      = /^https?:\/\/(?:www\.)?[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-\w()@:%+.~#?&/=]*$/

    let isValidURL = true

    if (hyperlinkEnable === true && urlInput) {
      isValidURL = urlRegex.test(urlInput)
    }

    if (isValidURL === false) {
      this.store.hyperlinkMessage = null
      this.store.hyperlinkError = 'URL is not valid'
      return
    }

    if (hyperlinkEnable === true && typeof urlInput === 'string') {
      // check if element contains child hyperlink tag
      // updated existing url
      if (hyperlink !== null && urlInput.length !== 0) {
        hyperlink.href = urlInput

        // Conditionally set the target attribute if openHyperlinkInNewTab is true
        if (openHyperlinkInNewTab === true) {
          hyperlink.target = '_blank'
        }
        if (openHyperlinkInNewTab === false) {
          hyperlink.removeAttribute('target')
        }

        hyperlink.textContent = this.store.element!.textContent
        this.store.hyperlinkMessage = 'Succesfully updated element hyperlink'
        this.store.elementContainsHyperlink = true
        return
      }

      // check if element contains child a tag
      if (hyperlink === null && urlInput.length !== 0) {
        // add a href
        if (parentHyperlink === null) {
          const link = document.createElement('a')
          link.href = urlInput

          // Conditionally set the target attribute if openHyperlinkInNewTab is true
          if (openHyperlinkInNewTab === true) {
            link.target = '_blank'
          }
          link.textContent = this.store.element!.textContent
          this.store.element!.textContent = ''
          this.store.element!.appendChild(link)
          this.store.hyperlinkMessage = 'Successfully added hyperlink to element'
          this.store.elementContainsHyperlink = true
          return
        }
      }
    }

    if (hyperlinkEnable === false && urlInput === 'removeHyperlink') {
      // To remove the added hyperlink tag
      const originalText = this.store.element!.textContent
      const textNode = document.createTextNode(originalText!)
      this.store.element!.textContent = ''
      this.store.element!.appendChild(textNode)
      this.store.hyberlinkEnable = false
      this.store.elementContainsHyperlink = false
    }
  }

  #checkForHyperlink() {
    const hyperlink = this.store.element!.querySelector('a')
    if (hyperlink !== null) {
      this.store.hyberlinkEnable = true
      this.store.elementContainsHyperlink = true
      this.store.hyperlinkInput = hyperlink.href
      this.store.hyperlinkMessage = null
      this.store.hyperlinkError = null

      if (hyperlink.target === '_blank') {
        this.store.openHyperlinkinkInNewTab = true
      }
      if (hyperlink.target !== '_blank') {
        this.store.openHyperlinkinkInNewTab = false
      }
      return
    }

    this.store.elementContainsHyperlink = false
    this.store.hyberlinkEnable = false
    this.store.hyperlinkInput = ''
    this.store.hyperlinkMessage = null
    this.store.hyperlinkError = null
  }

  handleHyperlink(hyperlinkEnable?: boolean, urlInput?: string, openHyperlinkInNewTab?: boolean) {
    this.store.hyperlinkAbility = true

    const parentHyperlink = this.store.element!.closest('a')

    // handle case where parent element already has an a href tag
    // when clicking directly on a hyperlink
    if (parentHyperlink !== null) {
      this.store.hyperlinkAbility = false
    }
    const elementTag = this.store.element!.tagName.toUpperCase()

    if (
      elementTag !== 'P'
      && elementTag !== 'H1'
      && elementTag !== 'H2'
      && elementTag !== 'H3'
      && elementTag !== 'H4'
      && elementTag !== 'H5'
      && elementTag !== 'H6'
    ) {
      this.store.hyperlinkAbility = false
    }

    if (hyperlinkEnable === undefined) {
      this.#checkForHyperlink()
      return
    }

    this.#addHyperlinkToElement(
      hyperlinkEnable,
      urlInput,
      openHyperlinkInNewTab,
    )
  }

  handleDesignerMethods() {
    if (!this.store.element) return

    // save current design
    this.saveCurrentDesignWithTimer()

    // invoke methods
    // handle custom URL
    this.handleHyperlink()
    // handle opacity
    this.handleOpacity()
    // handle BG opacity
    this.handleBackgroundOpacity()
    // displayed image
    this.showBasePrimaryImage()
    // border style
    this.handleBorderStyle()
    // border width
    this.handleBorderWidth()
    // border color
    this.handleBorderColor()
    // border radius
    this.handleBorderRadiusGlobal()
    // border radius
    this.handleBorderRadiusTopLeft()
    // border radius
    this.handleBorderRadiusTopRight()
    // border radius
    this.handleBorderRadiusBottomleft()
    // border radius
    this.handleBorderRadiusBottomRight()
    // handle font size
    this.handleFontSize()
    // handle font weight
    this.handleFontWeight()
    // handle font family
    this.handleFontFamily()
    // handle font style
    this.handleFontStyle()
    // handle vertical padding
    this.handleVerticalPadding()
    // handle horizontal padding
    this.handleHorizontalPadding()
    // handle vertical margin
    this.handleVerticalMargin()
    // handle horizontal margin
    this.handleHorizontalMargin()
    // handle color
    this.handleBackgroundColor()
    this.handleCustomBackgroundColor()

    this.handleTextColor()
    this.handleCustomTextColor()
    // handle classes
    this.currentClasses()
    // handle text content
    this.handleTextAreaContent()
  }
}
