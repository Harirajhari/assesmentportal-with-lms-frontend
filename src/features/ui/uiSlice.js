import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen:   true,
    notifications: [],
    editorPrefs: { fontSize: 14, tabSize: 2, minimap: false },
  },
  reducers: {
    toggleSidebar: (s)           => { s.sidebarOpen = !s.sidebarOpen },
    setSidebar:    (s, { payload }) => { s.sidebarOpen = payload },

    notify: (s, { payload }) => {
      s.notifications.push({
        id:       Date.now() + Math.random(),
        type:     'info',
        duration: 4000,
        ...payload,
      })
    },
    dismissNotif: (s, { payload }) => {
      s.notifications = s.notifications.filter(n => n.id !== payload)
    },

    setEditorPrefs: (s, { payload }) => {
      s.editorPrefs = { ...s.editorPrefs, ...payload }
    },
  },
})

export const { toggleSidebar, setSidebar, notify, dismissNotif, setEditorPrefs } = uiSlice.actions
export default uiSlice.reducer
