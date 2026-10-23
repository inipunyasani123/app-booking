import * as Haptics from 'expo-haptics';

export function getarSukses() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
