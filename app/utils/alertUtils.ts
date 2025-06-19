import { Alert } from 'react-native';

/**
 * Show success alert
 * @param title - Alert title
 * @param message - Alert message
 * @param onPress - Optional callback
 */
export const showSuccessAlert = (
  title: string, 
  message: string, 
  onPress?: () => void
): void => {
  Alert.alert(title, message, [
    { text: 'OK', onPress }
  ]);
};

/**
 * Show error alert
 * @param title - Alert title
 * @param message - Alert message
 * @param onPress - Optional callback
 */
export const showErrorAlert = (
  title: string, 
  message: string, 
  onPress?: () => void
): void => {
  Alert.alert(title, message, [
    { text: 'OK', onPress }
  ]);
};

/**
 * Show confirmation alert with Yes/No options
 * @param title - Alert title
 * @param message - Alert message
 * @param onConfirm - Callback for Yes button
 * @param onCancel - Optional callback for No button
 */
export const showConfirmAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): void => {
  Alert.alert(title, message, [
    { text: 'No', style: 'cancel', onPress: onCancel },
    { text: 'Yes', onPress: onConfirm }
  ]);
};

/**
 * Show unsaved changes alert
 * @param onSave - Callback for Save button
 * @param onDiscard - Callback for Discard button
 * @param onCancel - Optional callback for Cancel button
 */
export const showUnsavedChangesAlert = (
  onSave: () => void,
  onDiscard: () => void,
  onCancel?: () => void
): void => {
  Alert.alert(
    'Unsaved Changes',
    'You have unsaved changes. Do you want to save before leaving?',
    [
      { text: 'Discard', onPress: onDiscard },
      { text: 'Save', onPress: onSave },
      { text: 'Cancel', style: 'cancel', onPress: onCancel }
    ]
  );
};
