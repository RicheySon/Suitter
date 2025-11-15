import { useState } from "react";
import { Box, Button, TextArea, Flex, Text } from "@radix-ui/themes";
import { useCreateSuit } from "../hooks/useCreateSuit";
import { useCurrentAccount } from "@mysten/dapp-kit";

export function CreateSuitForm() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { createSuit } = useCreateSuit();
  const currentAccount = useCurrentAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAccount) {
      setError("Please connect your wallet first");
      return;
    }

    if (!content.trim()) {
      setError("Content cannot be empty");
      return;
    }

    if (content.length > 280) {
      setError("Content must be 280 characters or less");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    createSuit(
      content,
      [], // No media URLs for now
      (digest) => {
        setSuccess(`Suit created successfully! Transaction: ${digest}`);
        setContent("");
        setIsSubmitting(false);
      },
      (error) => {
        setError(error.message || "Failed to create suit");
        setIsSubmitting(false);
      }
    );
  };

  if (!currentAccount) {
    return (
      <Box p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
        <Text>Please connect your wallet to create a Suit</Text>
      </Box>
    );
  }

  return (
    <Box p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="3">
          <Text size="5" weight="bold">
            Create a Suit
          </Text>
          
          <TextArea
            placeholder="What's happening? (Max 280 characters)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            disabled={isSubmitting}
          />
          
          <Flex justify="between" align="center">
            <Text size="2" color="gray">
              {content.length}/280
            </Text>
            
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim() || content.length > 280}
            >
              {isSubmitting ? "Creating..." : "Post Suit"}
            </Button>
          </Flex>

          {error && (
            <Box p="2" style={{ background: "var(--red-a3)", borderRadius: 4 }}>
              <Text size="2" color="red">
                {error}
              </Text>
            </Box>
          )}

          {success && (
            <Box p="2" style={{ background: "var(--green-a3)", borderRadius: 4 }}>
              <Text size="2" color="green">
                {success}
              </Text>
            </Box>
          )}
        </Flex>
      </form>
    </Box>
  );
}
