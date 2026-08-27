import React, { useState } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { Button, ButtonText, ButtonSpinner } from '@gamelog/common/gluestack/button';
import { GLTextInput } from '@gamelog/common/GLTextInput';
import { ErrorBox, SuccessBox } from '@gamelog/common/feedbacks';
import apiManager from '@gamelog/api-manager/apiManager';
import { setSteamApiKey } from '@gamelog/api-manager/apiEndsPoints';

export const SteamApiKeyUpdateTest = () => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (!apiKey) {
      setError('Please enter a Steam API Key.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiManager.updateSteamApiKey(apiKey);
      setSteamApiKey(response.steam_api_key);
      setSuccess('Steam API Key updated successfully!');
      setApiKey('');
    } catch (err: unknown) {
      const errorWithResponse = err as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      const msg =
        errorWithResponse.response?.data?.detail ||
        errorWithResponse.message ||
        'Failed to update Steam API Key';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="gap-2.5">
      {error && <ErrorBox message={error} />}
      {success && <SuccessBox message={success} />}
      <GLTextInput
        label="New Steam API Key"
        placeholder="Enter new Steam API Key"
        value={apiKey}
        onChangeText={setApiKey}
        autoCapitalize="none"
      />
      <Button onPress={handleUpdate} isDisabled={loading}>
        {loading && <ButtonSpinner color="currentColor" />}
        <ButtonText>Update Steam API Key</ButtonText>
      </Button>
    </Box>
  );
};
