/**
 * Classe que representa um token de autorização.
 *
 * @param {string} value - A sequência de caracteres que representa o Token.
 * @param {number} expirationTime - Número de segundos que o token durará.
 * @param {string} scope - A lista de escopos (separados por espaço) que foi autorizado pelo usuário.
 */
export class TokenAuthorization {
  constructor(value, expirationTimeInSeconds, scope) {

    const EXISTING_SUAP_TOKEN = Cookies.get('suapToken');
    const EXISTING_SUAP_EXP_TIME = Cookies.get('suapTokenExpirationTime');
    const EXISTING_SUAP_SCOPE = Cookies.get('suapScope');

    /**
     * Alguns atributos recebem valores condicionais. Caso o cookie relacionado ao atribuito não
     * exista previamente, o seu valor vai ser o do parâmetro vindo do construtor.
     */
    this.value = EXISTING_SUAP_TOKEN || value;
    this.startTime = new Date().getTime(); // O valor em milissegundos.
    this.finishTime = EXISTING_SUAP_EXP_TIME || new Date(this.startTime + expirationTimeInSeconds * 1000);
    this.scope = EXISTING_SUAP_SCOPE || scope;

    // Caso um dos cookies não exista previamente, crie-o.

    if (!EXISTING_SUAP_TOKEN) {
      Cookies.set('suapToken', this.value, { expires: this.finishTime });
    }

    if (!EXISTING_SUAP_EXP_TIME) {
      Cookies.set('suapTokenExpirationTime', this.finishTime, { expires: this.finishTime });
    }

    if (!EXISTING_SUAP_SCOPE) {
      Cookies.set('suapScope', this.scope, { expires: this.finishTime });
    }

  }

  getValue() {
    return this.value;
  }

  getExpirationTime = function () {
    return this.finishTime;
  };

  getScope = function () {
    return this.scope;
  };

  isValid = function () {
    return Cookies.get('suapToken') && this.value;
  };

  revoke = function () {

    this.value = null;
    this.startTime = null;
    this.finishTime = null;

    Cookies.remove('suapToken');
    Cookies.remove('suapTokenExpirationTime');
    Cookies.remove('suapScope');

  };

};

/**
 * Classe principal do SDK e seu construtor, que inicializa os principais atributos.
 *
 * @constructor
 *
 * @param {string} authHost - URI do host de autenticação.
 * @param {string} clientID - ID da aplicação registrado no SuapClient.
 * @param {string} redirectURI - URI de redirecionamento da aplicação cadastrada no SuapClient.
 *
 */
export class SuapClient {
  constructor(authHost, clientID, redirectURI, scope) {
    
    this.authHost = authHost;
    this.clientID = clientID;
    this.redirectURI = redirectURI;
    this.scope = scope;

    this.resourceURL = authHost + '/api/eu/';
    this.authorizationURL = authHost + '/o/authorize/';
    this.logoutURL = authHost + '/o/revoke_token/';

    this.responseType = 'token';
    this.grantType = 'implict'; // Necessário para utilizar Oauth2 com Javascript

    // Remove a '/' caso ela já esteja inserida no auth_host.
    if (authHost.charAt(authHost.length - 1) == '/') {
      this.authHost = authHost.substr(0, authHost.length - 1);
    }

    this.dataJSON = null;
    this.token = null;
  }

  /**
   * Extrai o token da URL e retorna-o.
   *
   * @return {string} O token de autorização presente na URL de retorno.
   */
  extractToken = function() {
    const match = document.location.hash.match(/access_token=(\w+)/);
    if (match != null) {
      return !!match && match[1];
    }
    return null;
  };


  /**
   * Extrai os escopos autorizados da URL e retorna-os caso o usuário já esteja autenticado.
   * @return {string} Escopos autorizados pelo usuário (separados por espaço).
   */
  extractScope = function() {
    const match = document.location.hash.match(/scope=(.*)/);
    if (match != null) {
      return match[1].split('+').join(' ');
    }
    return null;
  };

  /**
   * Extrai o tempo de duração do token (em segundos) da URL.
   * @return {number} Tempo de duração do token.
   */
  extractDuration = function() {
    const match = document.location.hash.match(/expires_in=(\d+)/);
    if (match != null) {
      return Number(!!match && match[1]);
    }
    return 0;
  };

  getCookie = function (name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  };


  /* Métodos públicos */

  /**
   * Inicializa os objetos token e o dataJSON.
   *
   */
  init = function() {
    this.token = new TokenAuthorization(this.extractToken(), this.extractDuration(), this.extractScope());
    this.dataJSON = {};
  };

  /**
   * Retorna o objeto token.
   *
   * @return {string} token se o usuário estiver autenticado; null caso contrário.
   */
  getToken = function() {
    return this.token;
  };


  /**
   * Retorna o objeto dataJSON, que contém os dados retornados após a requisição Ajax.
   *
   * @return {Object} O objeto JSON com os dados requisitados.
   */
  getDataJSON = function() {
    return this.dataJSON;
  };


  /**
   * Retorna a URI de redirecionamento.
   *
   * @return {string} URI de redirecionamento.
   */
  getRedirectURI = function() {
    return this.redirectURI;
  };

  /**
   * Retorna se o usuário está autenticado ou não com base no estado do token.
   * @return {Boolean} true se o usuário estiver autenticado; false caso contrário.
   */
  isAuthenticated = function() {
    return this.token.isValid();
  };


  /**
   * Cria a URL de login com todos os parâmetros da aplicação.
   * @return {string} A URL de login do SuapClient.
   */
  getLoginURL = function() {
    const loginUrl = this.authorizationURL +
      "?response_type=" + this.responseType +
      "&grant_type="    + this.grantType +
      "&client_id="     + this.clientID +
      "&scope="  + this.scope;
      "&redirect_uri="  + this.redirectURI;
    return loginUrl;
  };


  /**
   * Cria a URL de cadastro com retorno.
   * @return {string} A URL de cadastro do SuapClient.
   */
  getRegistrationURL = function() {
    const registrationUrl = this.authHost +
      "/register/" +
      "?redirect_uri="  + this.redirectURI;
    return registrationUrl;
  };

  getResource = function(callback) {
    const resourceURL = this.resourceURL
    const scope = this.scope
    const token = this.token
  	$.ajax({
		  url: resourceURL,
      data: {'scope': scope},
      headers: {
        "Authorization": "Bearer " + token.getValue(),
        "Accept": "application/json"
      },
		  type: 'GET',
      success: function(response) {
        callback(response);
      },
      error: function() {
        alert('Falha na comunicação com o SUAP');
      }
    });
  };

  login = function() {
    window.location = this.getLoginURL();
  };
	
  logout = function() {
    const logoutURL = this.logoutURL
    const clientID = this.clientID
    const token = this.token
    const redirectURI = this.redirectURI
  	$.ajax({
		  url: logoutURL,
      data: {'token': token.getValue(), 'client_id': clientID},
		  type: 'POST',
      success: function() {
        token.revoke();
        window.location = redirectURI;
      },
      error: function() {
        alert('Falha na comunicação com o SUAP');
      }
    });
  };
  
};