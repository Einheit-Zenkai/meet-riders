import { Alert, Platform } from 'react-native';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

/**
 * Cross-platform alert that works on both native and web.
 * On native → Alert.alert with full button support.
 * On web → window.confirm for destructive/cancel buttons,
 *           window.alert for simple info, with callback invocation.
 */
export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
): void => {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  // Web fallback
  if (!buttons || buttons.length === 0) {
    window.alert(`${title}\n\n${message ?? ''}`);
    return;
  }

  if (buttons.length === 1) {
    window.alert(`${title}\n\n${message ?? ''}`);
    buttons[0].onPress?.();
    return;
  }

  // Two or more buttons → use confirm
  // The last non-cancel button is treated as the "OK" action
  const cancelBtn = buttons.find((b) => b.style === 'cancel');
  const actionBtn = buttons.find((b) => b.style !== 'cancel') ?? buttons[buttons.length - 1];

  const confirmed = window.confirm(`${title}\n\n${message ?? ''}`);
  if (confirmed) {
    actionBtn?.onPress?.();
  } else {
    cancelBtn?.onPress?.();
  }
};
