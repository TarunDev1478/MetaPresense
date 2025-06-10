#include <stdio.h>
#include <string.h>

int main() {
    int seed[6], taps[6], shiftRegister[6], keyStream[6];
    int plainText[] = {1, 0, 1, 1, 0, 1};
    int messageLength = sizeof(plainText) / sizeof(plainText[0]);
    int cipherText[messageLength], decryptedText[messageLength];

    printf("Enter 6-bit seed:\n");
    for (int i = 0; i < 6; i++) {
        scanf("%d", &seed[i]);
    }

    printf("Enter 6-bit tap coefficients:\n");
    for (int i = 0; i < 6; i++) {
        scanf("%d", &taps[i]);
    }

    memcpy(shiftRegister, seed, sizeof(seed));
    
    for (int i = 0; i < messageLength; i++) {
        keyStream[i] = shiftRegister[0];
        int feedback = 0;
        for (int j = 0; j < 6; j++) {
            feedback ^= (shiftRegister[j] * taps[j]);
        }
        memmove(shiftRegister, shiftRegister + 1, 5 * sizeof(int));
        shiftRegister[5] = feedback;
    }

    for (int i = 0; i < messageLength; i++) {
        cipherText[i] = plainText[i] ^ keyStream[i];
        decryptedText[i] = cipherText[i] ^ keyStream[i];
    }

    printf("Key Stream: ");
    for (int i = 0; i < messageLength; i++) {
        printf("%d", keyStream[i]);
    }
    printf("\n");

    printf("Plaintext: ");
    for (int i = 0; i < messageLength; i++) {
        printf("%d", plainText[i]);
    }
    printf("\n");

    printf("Ciphertext: ");
    for (int i = 0; i < messageLength; i++) {
        printf("%d", cipherText[i]);
    }
    printf("\n");

    printf("Decrypted Text: ");
    for (int i = 0; i < messageLength; i++) {
        printf("%d", decryptedText[i]);
    }
    printf("\n");

    int match = 1;
    for (int i = 0; i < messageLength; i++) {
        if (plainText[i] != decryptedText[i]) {
            match = 0;
            break;
        }
    }

    if (match) {
        printf("LFSR validation successful: Decrypted text matches original plaintext.\n");
    } else {
        printf("LFSR validation failed: Decrypted text does not match original plaintext.\n");
    }

    return 0;
}
