use tauri::{Runtime, Window};

#[cfg(target_os = "windows")]
use raw_window_handle::{HasWindowHandle, RawWindowHandle};
#[cfg(target_os = "windows")]
use windows::Win32::Foundation::HWND;
#[cfg(target_os = "windows")]
use windows::Win32::UI::WindowsAndMessaging::{
    GetWindowLongPtrW, SetWindowLongPtrW, GWL_EXSTYLE, WS_EX_TRANSPARENT,
};

use tauri::menu::{Menu, MenuItem};

#[tauri::command]
#[cfg_attr(not(target_os = "windows"), allow(unused_variables))]
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
                        SetWindowLongPtrW(
                            hwnd,
                            GWL_EXSTYLE,
                            ex_style | WS_EX_TRANSPARENT.0 as isize,
                        );
                    } else {
                        SetWindowLongPtrW(
                            hwnd,
                            GWL_EXSTYLE,
                            ex_style & !WS_EX_TRANSPARENT.0 as isize,
                        );
                    }
                }
            }
        }
    }
    Ok(())
}

#[tauri::command]
pub fn show_context_menu<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
) -> Result<(), String> {
    let settings = MenuItem::with_id(&app, "settings", "Settings", true, None::<&str>)
        .map_err(|e| e.to_string())?;
    let about =
        MenuItem::with_id(&app, "about", "About", true, None::<&str>).map_err(|e| e.to_string())?;
    let quit =
        MenuItem::with_id(&app, "quit", "Quit", true, None::<&str>).map_err(|e| e.to_string())?;

    let menu = Menu::with_items(&app, &[&settings, &about, &quit]).map_err(|e| e.to_string())?;

    window.popup_menu(&menu).map_err(|e| e.to_string())?;
    Ok(())
}
