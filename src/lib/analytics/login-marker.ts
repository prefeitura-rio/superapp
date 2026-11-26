/**
 * Marcador de login recém-feito, para contar logins no Google Analytics.
 *
 * Criado pelo callback do Keycloak só quando há consentimento de análise e
 * consumido (apagado) pelo `LoginEventTracker`. O valor é fixo: não carrega
 * nome, CPF, e-mail nem qualquer outro dado pessoal.
 */
export const LOGIN_MARKER_COOKIE = 'just_logged_in'

export const LOGIN_MARKER_VALUE = '1'

/** Tempo para o redirect do login terminar e o tracker ler o marcador. */
export const LOGIN_MARKER_MAX_AGE = 60
