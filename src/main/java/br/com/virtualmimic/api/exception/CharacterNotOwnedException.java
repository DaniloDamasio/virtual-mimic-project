package br.com.virtualmimic.api.exception;

public class CharacterNotOwnedException extends RuntimeException {
    public CharacterNotOwnedException(String message) {
        super(message);
    }
}
