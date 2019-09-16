/**
 * オプションページからTwitterのOAuth1.0認証認可を行う
 */

let message = {
  "parameters": {
    "oauth_consumer_key": "YOUR_CONSUMER_KEY",
    "oauth_signature_method": "HMAC-SHA1"
  }
};

let accessor = {
  "consumerSecret": "YOUR_CONSUMER_SECRET"
};

const startAuthorize = () => {

  // request tokenの取得用設定
  message.action = "https://api.twitter.com/oauth/request_token";
  message.method = "POST";

  // oauth_nonce, oauth_timestamp, oauth_signatureの設定
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);

  fetch(
    // request tokenの取得
    OAuth.addToURL(message.action, message.parameters), {
      method: "POST"
    }
  ).then(response => {
    return response.text();
  }).then(text => {
    // searchParamsを使うために適当なURLにくっつける
    let url = new URL("http://example.com?" + text);
    let token = url.searchParams.get("oauth_token");
    let secret = url.searchParams.get("oauth_token_secret");

    // 取得したrequest tokenをmessageにset
    message.parameters.oauth_token = token;
    accessor.oauth_token_secret = secret;

  }).then(authorize);
}

const authorize = () => new Promise((resolve, reject) => {

  // 認可用のURLで認可開始
  chrome.identity.launchWebAuthFlow({
    url: "https://api.twitter.com/oauth/authorize?oauth_token=" + message.parameters.oauth_token,
    interactive: true
  }, responseUrl => {
    let url = new URL(responseUrl);

    // callback URLで渡されたverifierを取得する
    let oauth_verifier = url.searchParams.get("oauth_verifier");
    // 取得したverifierをmessageにset
    message.parameters.oauth_verifier = oauth_verifier;

    // access token取得用の設定
    message.action = "https://api.twitter.com/oauth/access_token";
    message.method = "POST";

    // oauth_nonce, oauth_timestamp, oauth_signatureの設定
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    fetch(
      // access_tokenとaccess_token_secretの取得
      OAuth.addToURL(message.action, message.parameters), {
        method: "POST"
      }
    ).then(res => {
      return res.text();
    }).then(text => {
      alert(text);
    })
  })
})

document.getElementById("Oadd").addEventListener('click', startAuthorize, false);
