import { inject, onMounted, provide, reactive, type Reactive } from 'vue'
import { v4 as uuid } from 'uuid'
import { Designer, type DesignerState } from '../utils/designer'
import defaultComponents from '../utils/default-components'

export const useInitDesigner = () => {
  const state = reactive<DesignerState>({
    menuPreview: false,
    menuLeft: true,
    menuRight: true,
    // border style, width & color / start
    borderStyle: null,
    borderWidth: null,
    borderColor: null,
    // border style, width & color / end
    // border radius / start
    borderRadiusGlobal: null,
    borderRadiusTopLeft: null,
    borderRadiusTopRight: null,
    borderRadiusBottomleft: null,
    borderRadiusBottomRight: null,
    // border radius / end
    // hyperlink / start
    elementContainsHyperlink: false,
    hyperlinkAbility: false,
    hyperlinkInput: null,
    hyperlinkMessage: null,
    hyperlinkError: null,
    hyberlinkEnable: false,
    openHyperlinkinkInNewTab: null,
    // hyperlink / end
    opacity: null,
    backgroundOpacity: null,
    textAreaVueModel: null,
    nextSibling: null,
    parentElement: null,
    restoredElement: null,
    currentClasses: [],
    fontVerticalPadding: null,
    fontHorizontalPadding: null,
    fontVerticalMargin: null,
    fontHorizontalMargin: null,
    fontStyle: null,
    fontFamily: null,
    fontWeight: null,
    fontBase: null,
    fontDesktop: null,
    fontTablet: null,
    fontMobile: null,
    // background color / start
    enabledCustomColorBackground: null,
    backgroundColorCustom: null,
    backgroundColor: null,
    // background color / end
    // text color / start
    enabledCustomColorText: null,
    textColorCustom: null,
    textColor: null,
    // text color / end
    element: null,
    component: null,
    components: [],
    basePrimaryImage: null,
    highlightedImage: null,
    fetchedComponents: { isError: false, isLoading: true, components: [] },
    preview: '',
    showPreview: false,
  })
  onMounted(() => {
    setTimeout(() => {
      state.fetchedComponents.components = defaultComponents.map(c => ({ ...c, id: uuid() }))
      state.fetchedComponents.isLoading = false
    }, 500)
  })
  provide('designerState', state)

  const designer = new Designer(state)
  provide('designer', designer)

  return { state, designer }
}

export const useDesigner = () => {
  const state = inject<Reactive<DesignerState>>('designerState')!
  const designer = inject<Designer>('designer')!

  return { state, designer }
}
