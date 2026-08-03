/* The account sheet, opened from the Options sheet. It is one form that flips
   between signing in and creating an account, and once someone is signed in it
   shows their email with a sign out button instead.

   An account is optional and only adds cloud saved progressions, so the sheet says
   that plainly rather than making it look like something the app needs. */

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { COLORS } from '../../styles/colors';
import { commonStyles } from '../../styles/commonStyles';
import { ModalSafeArea } from './ModalSafeArea';

// Deleting an account is handled on the info site rather than in the app, since it
// needs the email confirmation step and a proper explanation of what gets removed
const DELETE_ACCOUNT_URL = 'https://can1cyp2.github.io/FretFind-Info_Site/delete-account';

interface Props {
  visible: boolean;
  onClose: () => void;
  isSignedIn: boolean;
  email: string | null;
  autoBackup: boolean;           // whether saving a progression also copies it to the account
  onToggleAutoBackup: () => void;
  restorableCloudCount: number;  // how many account progressions have no copy on this device yet
  onTransferAllFromCloud: () => Promise<void>; // moves every one of those down to this device
  onSignIn: (email: string, password: string) => Promise<string | null>;
  onSignUp: (email: string, password: string) => Promise<string | null>;
  onSignOut: () => Promise<string | null>;
}

export function AccountModal({
  visible,
  onClose,
  isSignedIn,
  email,
  autoBackup,
  onToggleAutoBackup,
  restorableCloudCount,
  onTransferAllFromCloud,
  onSignIn,
  onSignUp,
  onSignOut,
}: Props) {
  // Which half of the form is showing: signing in, or creating an account
  const [isCreating, setIsCreating] = useState(false);
  const [emailText, setEmailText] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  // True while waiting on the server, so the button can be disabled and show a spinner
  const [isBusy, setIsBusy] = useState(false);

  // The same idea for the two other things here that go to the network. Both used to
  // sit there doing nothing visible until they finished, and signing out does not
  // even close the sheet until it is done, which looked like the app had stopped.
  const [isTransferring, setIsTransferring] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const resetForm = useCallback(() => {
    setEmailText('');
    setPassword('');
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!emailText.trim() || !password) {
      setError('Enter your email and a password.');
      return;
    }
    // Supabase will not accept anything shorter, so it is caught here first
    if (isCreating && password.length < 6) {
      setError('Password needs to be at least 6 characters.');
      return;
    }

    setIsBusy(true);
    setError(null);
    const message = isCreating
      ? await onSignUp(emailText, password)
      : await onSignIn(emailText, password);
    setIsBusy(false);

    if (message) {
      setError(message);
      return;
    }
    if (isCreating) {
      // Creating an account does not sign you in until the email is confirmed
      Alert.alert(
        'Check your email',
        'We sent you a confirmation link. Open it, then come back and sign in.',
      );
      setIsCreating(false);
      resetForm();
      return;
    }
    // Signing in worked, the sheet has done its job
    resetForm();
    onClose();
  }, [emailText, password, isCreating, onSignUp, onSignIn, resetForm, onClose]);

  // Deleting the account happens on the website, so this only explains that and
  // opens it. Nothing is deleted from inside the app.
  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete account',
      'Account deletion is handled on the FretFind website, where you can confirm it properly. Your progressions saved on this device are not affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open website',
          onPress: () => {
            Linking.openURL(DELETE_ACCOUNT_URL).catch(() => {
              Alert.alert('Could not open the browser', DELETE_ACCOUNT_URL);
            });
          },
        },
      ],
    );
  }, []);

  /* Transferring takes the progressions off the account, so it asks first the same
     way deleting one does. It is not destructive as such (they land on the phone
     first, and only then come off the account) but it does mean they stop following
     the user to another device, which is worth saying out loud before it happens. */
  const handleTransferAll = useCallback(() => {
    Alert.alert(
      'Transfer to this phone',
      `This moves ${restorableCloudCount} progression${restorableCloudCount === 1 ? '' : 's'} onto this device and removes ${restorableCloudCount === 1 ? 'it' : 'them'} from your account. ${restorableCloudCount === 1 ? 'It' : 'They'} will stay on this phone and will not be backed up again on their own.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer',
          onPress: async () => {
            setIsTransferring(true);
            try {
              await onTransferAllFromCloud();
            } finally {
              setIsTransferring(false);
            }
          },
        },
      ],
    );
  }, [restorableCloudCount, onTransferAllFromCloud]);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign out', 'Your device saved progressions stay on this phone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setIsSigningOut(true);
          try {
            await onSignOut();
          } finally {
            setIsSigningOut(false);
          }
          onClose();
        },
      },
    ]);
  }, [onSignOut, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <ModalSafeArea>
      {/* Shifts the sheet up when the keyboard covers the fields */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={commonStyles.modalOverlay} onPress={handleClose}>
          <Pressable style={commonStyles.modalContent} onPress={event => event.stopPropagation()}>
            <View style={commonStyles.modalHandle} />
            <View style={commonStyles.modalHeader}>
              <Text style={commonStyles.modalTitle}>Account</Text>
              <Pressable onPress={handleClose} style={commonStyles.modalCloseButton} hitSlop={8}>
                <Text style={commonStyles.modalCloseText}>{'✕'}</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {isSignedIn ? (
                <>
                  <Text style={styles.signedInLabel}>Signed in as</Text>
                  <Text style={styles.signedInEmail}>{email}</Text>
                  <Text style={styles.explainer}>
                    Your progressions can now be saved to the cloud, so you can load them
                    on another device.
                  </Text>

                  {/* Auto backup: when this is on, saving a progression puts a copy on
                      the account as well, so nothing is lost if the phone is. */}
                  <Pressable onPress={onToggleAutoBackup} style={commonStyles.settingCard}>
                    <View style={commonStyles.settingCardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={commonStyles.settingTitle}>Auto backup progressions</Text>
                        <Text style={commonStyles.settingValue}>
                          {autoBackup
                            ? 'On, saved progressions are copied to your account'
                            : 'Off, progressions are only saved on this device'}
                        </Text>
                      </View>
                      <View style={[commonStyles.switchTrack, autoBackup && commonStyles.switchTrackOn]}>
                        <View style={[commonStyles.switchThumb, autoBackup && commonStyles.switchThumbOn]} />
                      </View>
                    </View>
                  </Pressable>

                  {/* Only shown when there is actually something to bring down: cloud
                      progressions with no copy on this device yet. This one is a move
                      rather than a copy, they come off the account once they are on
                      the phone, so it asks first. */}
                  {restorableCloudCount > 0 && (
                    <Pressable
                      onPress={handleTransferAll}
                      disabled={isTransferring}
                      style={[styles.restoreAllButton, isTransferring && { opacity: 0.7 }]}
                    >
                      {isTransferring ? (
                        <>
                          <ActivityIndicator size="small" color={COLORS.accentLight} />
                          <Text style={styles.restoreAllSubtext}>Transferring...</Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.restoreAllText}>
                            Transfer {restorableCloudCount} progression
                            {restorableCloudCount === 1 ? '' : 's'} from the cloud to this phone
                          </Text>
                          <Text style={styles.restoreAllSubtext}>
                            Moves them onto this device and removes them from your account
                          </Text>
                        </>
                      )}
                    </Pressable>
                  )}

                  <Pressable
                    onPress={handleSignOut}
                    disabled={isSigningOut}
                    style={[styles.signOutButton, isSigningOut && { opacity: 0.7 }]}
                  >
                    {isSigningOut ? (
                      <ActivityIndicator size="small" color={COLORS.textPrimary} />
                    ) : (
                      <Text style={styles.signOutText}>Sign out</Text>
                    )}
                  </Pressable>

                  {/* Deleting the account is the most permanent thing here, so it sits
                      apart at the bottom rather than beside the everyday buttons */}
                  <Pressable onPress={handleDeleteAccount} style={styles.deleteAccountButton}>
                    <Text style={styles.deleteAccountText}>Delete account</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.explainer}>
                    An account is optional. Everything in FretFind works without one, an
                    account only lets you save your progressions to the cloud and load them
                    on another device.
                  </Text>

                  <TextInput
                    value={emailText}
                    onChangeText={setEmailText}
                    placeholder="Email"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    style={styles.input}
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                    style={styles.input}
                  />

                  {error && <Text style={styles.errorText}>{error}</Text>}

                  <Pressable
                    onPress={handleSubmit}
                    disabled={isBusy}
                    style={[commonStyles.saveButton, styles.submitButton, isBusy && { opacity: 0.6 }]}
                  >
                    {isBusy ? (
                      <ActivityIndicator color={COLORS.textOnAccent} />
                    ) : (
                      <Text style={commonStyles.saveButtonText}>
                        {isCreating ? 'Create account' : 'Sign in'}
                      </Text>
                    )}
                  </Pressable>

                  {/* Flips the form between its two jobs */}
                  <Pressable
                    onPress={() => {
                      setIsCreating(prev => !prev);
                      setError(null);
                    }}
                    style={styles.switchModeButton}
                  >
                    <Text style={styles.switchModeText}>
                      {isCreating
                        ? 'Already have an account? Sign in'
                        : 'New here? Create an account'}
                    </Text>
                  </Pressable>
                </>
              )}

              <View style={{ height: 24 }} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
      </ModalSafeArea>
    </Modal>
  );
}

const styles = StyleSheet.create({
  explainer: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.bgElevated,
    color: COLORS.textPrimary,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    fontSize: 15,
    marginBottom: 10,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  submitButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 6,
  },
  switchModeButton: {
    alignSelf: 'center',
    paddingVertical: 14,
  },
  switchModeText: {
    color: COLORS.accentLight,
    fontSize: 13,
    fontWeight: '600',
  },
  signedInLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  signedInEmail: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 14,
  },
  // The bulk restore button: quieter than the main account actions since it is an
  // occasional tidy-up rather than something used every visit to this screen
  restoreAllButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
    alignItems: 'center',
  },
  restoreAllText: {
    color: COLORS.accentLight,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Spells out that this is a move rather than a copy, right on the button
  restoreAllSubtext: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 3,
  },
  signOutButton: {
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  signOutText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  // Kept quiet and set apart, since it is the one action here that cannot be undone
  deleteAccountButton: {
    alignSelf: 'center',
    paddingVertical: 16,
    marginTop: 12,
  },
  deleteAccountText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});
