use tauri::{Runtime, Window};

#[cfg(target_os = "windows")]
use windows::Win32::UI::WindowsAndMessaging::{
    GetWindowLongPtrW, SetWindowLongPtrW, GWL_EXSTYLE, WS_EX_TRANSPARENT,
};
#[cfg(target_os = "windows")]
use windows::Win32::Foundation::HWND;
#[cfg(target_os = "windows")]
use raw_window_handle::{HasWindowHandle, RawWindowHandle};

#[tauri::command]
pub fn set_click_through<R: Runtime>(window: Window<R>, enabled: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        if let Ok(handle) = window.window_handle() {
            let raw = handle.as_raw();
            if let RawWindowHandle::Win32(win32_handle) = raw {
                let hwnd = HWND(win32_handle.hwnd.get() as _);
                unsafe {
                    let ex_style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
                    if enabled {
                        SetWindowLongPtrW(hwnd, GWL_EXSTYLE, ex_style | WS_EX_TRANSPARENT.0 as isize);
                    } else {
                        SetWindowLongPtrW(hwnd, GWL_EXSTYLE, ex_style & !WS_EX_TRANSPARENT.0 as isize);
                    }
                }
            }
        }
    }
    Ok(())
}
