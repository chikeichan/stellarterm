const React = window.React = require('react');
const images = require('../../images');


// TODO: Move this into Validator
const isValidSecretKey = input => {
  try {
    StellarSdk.Keypair.fromSecret(input);
    return true;
  } catch (e) {
    // console.error(e);
    return false;
  }
}

const isValidBip32Path = input => {
  if (!input.startsWith("44'/148'")) {
    return false;
  }
  input.split('/').forEach(function (element) {
    if (!element.toString().endsWith('\'')) {
      return false;
    }
  });
  return true;
}

export default class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      secretInput: '',
      show: false,
      invalidKey: false,
      newKeypair: null,
      bip32Path: "44'/148'/0'",
      currentTab: 'ledger', // 'login', 'createAccount', 'ledger'
    }


    this.handleInput = (event) => {
      this.setState({secretInput: event.target.value});
    }
    this.handleBip32PathInput = (event) => {
      this.setState({bip32Path: event.target.value});
    }
    this.proceedWithLedger = (event) => {
      event.preventDefault();
      if (!isValidBip32Path(this.state.bip32Path)) {
        return this.setState({
          invalidBip32Path: true
        });
      }
      this.props.d.session.handlers.logInWithLedger(this.state.bip32Path)
    }
    this.toggleShow = (event) => {
      event.preventDefault();
      this.setState({show: !this.state.show});
    }
    this.setTab = (tabName) => {
      this.setState({currentTab: tabName});
    }
    this.handleSubmit = (event) => {
      event.preventDefault();
      if (!isValidSecretKey(this.state.secretInput)) {
        return this.setState({
          invalidKey: true,
        })
      }
      this.props.d.session.handlers.logInWithSecret(this.state.secretInput);
    }
    this.handleGenerate = event => {
      let keypair = StellarSdk.Keypair.random();
      this.setState({
        newKeypair: {
          pubKey: keypair.publicKey(),
          secretKey: keypair.secret(),
        }
      });
    }
  }

  componentDidMount() {
    this.mounted = true;
    setTimeout(this.tickLedger, 1);
  }
  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    let d = this.props.d;
    let errorMessage;
    if (this.state.invalidKey) {
      errorMessage = <div className="s-alert s-alert--alert">Invalid secret key. Hint: it starts with the letter S and is all uppercase</div>
    } else if (this.props.setupError) {
      errorMessage = <div className="s-alert s-alert--alert">Unable to contact network. Please check your internet connection and allow connections to horizon.stellar.org. Maybe an adblocker or plugin (such as Privacy Badger) is preventing the client from communicating with the network.</div>
    }

    let newKeypairDetails;
    if (this.state.newKeypair !== null) {
      newKeypairDetails = <div className="LoginPage__generatedNote">
        <p><strong>Keep your key secure. This secret key will only be showed to you once. StellarTerm does not save it and will not be able to help you recover it if lost.</strong></p>
        <p>Public key (will be your Account ID): {this.state.newKeypair.pubKey}</p>
        <p>Secret key (<strong>SAVE THIS AND KEEP THIS SECURE</strong>): {this.state.newKeypair.secretKey}</p>
      </div>
    }

    let inputType = this.state.show ? 'text' : 'password';

    let body;

    if (this.state.currentTab === 'login') {
      body = <div className="LoginPage__body">
        <div className="LoginPage__box">
          <div className="LoginPage__form">
            <p className="LoginPage__intro">Log in with your secret key to manage your account.</p>
            <form onSubmit={this.handleSubmit}>
              <label className="s-inputGroup LoginPage__inputGroup">
                <input type={inputType} className="s-inputGroup__item S-flexItem-share LoginPage__password" value={this.state.secretInput} onChange={this.handleInput} placeholder="Secret key (example: SBSMVCIWBL3HDB7N4EI3QKBKI4D5ZDSSDF7TMPB.....)" />
                <div>
                  <a className="LoginPage__show s-button s-button--light" onClick={this.toggleShow}>Show</a>
                </div>
              </label>
              {errorMessage}
              <div>
                <input type="submit" className="LoginPage__submit s-button" value="Log in"></input>
              </div>
            </form>
          </div>
          <div className="LoginPage__notes">
            <h3>Security notes</h3>
            <ul>
              <li>Check the url to make sure you are on the correct website.</li>
              <li>Stellarterm does not save your secret key. It is stored on your browser and will be deleted once the page is refreshed or exited.</li>
              <li>For extra security, you can <a href="https://github.com/irisli/stellarterm" target="_blank" rel="nofollow noopener noreferrer">build from source</a> or <a href="https://github.com/stellarterm/stellarterm.github.io/" target="_blank" rel="nofollow noopener noreferrer">download from GitHub</a> and verify the hash.</li>
              <li>StellarTerm is released under the Apache 2.0. It is provided "AS IS" without warranty. The developer is not responsible for any losses and activities caused by the application.</li>
            </ul>
          </div>
        </div>
      </div>
    } else if (this.state.currentTab === 'createAccount') {
      body = <div className="LoginPage__body">
        <div className="LoginPage__box">
          <div className="LoginPage__form">
            <h3>Create Account Keypair</h3>
            <p>To get started on using the Stellar network, you must first create a keypair. The keypair consists of two parts:</p>
            <ul>
              <li><strong>Public key</strong>: The public key is used to identify the account. It is also known as an account. This public key is used for receiving funds.</li>
              <li><strong>Secret key</strong>: The secret key is used to access your account and make transactions. Keep this code safe and secure. Anyone with the code will have full access to the account and funds. If you lose the key, you will no longer be able to access the funds and there is no recovery mechanism.</li>
            </ul>
            <input type="submit" className="LoginPage__generate s-button" onClick={this.handleGenerate} value="Generate keypair"></input>
            {newKeypairDetails}
          </div>
          <div className="LoginPage__notes">
            <h3>Account generation security notes</h3>
            <p>The key is generated using entropy from <a href="https://github.com/dchest/tweetnacl-js#random-bytes-generation">TweetNaCl's randomByte function</a> which, in most browsers, uses getRandomValues from the <a href="https://w3c.github.io/webcrypto/Overview.html">Web Cryptography API</a>. However, using a secure random number generation does not protect you from a compromised computer. Take great care to make sure your computer is secure and do not run this on a computer you do not trust.</p>
          </div>
        </div>
      </div>
    } else if (this.state.currentTab === 'ledger') {
      let ledgerSignInButton;
      let ledgerSetupErrorMessage;
      if (d.session.setupLedgerError) {
        // This usually doesn't happen. To simulate this, find the line:
        // new StellarLedger.Api(new StellarLedger.comm(NUMBER))
        // and change the number to something low so it has a timeout
        ledgerSetupErrorMessage = <div className="s-alert s-alert--alert LoginPage__error">Connected to Ledger but returned an error: <br /><strong>{d.session.setupLedgerError}</strong></div>
      }

      if (d.session.ledgerConnected) {
        ledgerSignInButton = <input type="submit" className="LoginPage__submit inputGroup__item s-button" value="Sign in with Ledger"/>
      } else {
        ledgerSignInButton = <input type="submit" className="LoginPage__submit inputGroup__item s-button" value="Connect Ledger on a supported browser" disabled={true}/>
      }
      let ledgerErrorMessage;
      if (this.state.invalidBip32Path) {
        ledgerErrorMessage = <div className="s-alert s-alert--alert LoginPage__error">Invalid BIP32 path. Stellar BIP32 paths must be of the form 44'/148'/n'.</div>
      }

      let loginForm;
      if (!d.session.ledgerConnected) {
        loginForm = <div className="LoginPage__form LoginPage__form--simpleMessage">
          <p className="LoginPage__form--title">Scanning for Ledger Wallet connection...</p>
          <p>Please plug in your Ledger and open the Stellar app. Make sure browser support is set to yes.</p>
        </div>
      } else {
        loginForm = <div className="LoginPage__form">
          <p className="LoginPage__form--title">Ledger Wallet found and connected!</p>
          <form onSubmit={this.proceedWithLedger}>
            <label className="s-inputGroup LoginPage__inputGroup LoginPage__inputGroup--path">
              <input name="bip32Path" type="text" className="s-inputGroup__item" value={this.state.bip32Path} onChange={this.handleBip32PathInput} placeholder="BIP32 path, e.g.: 44'/148'/0'" />
            </label>
            {ledgerErrorMessage}
            <div>
              <input type="submit" className="LoginPage__submit inputGroup__item s-button" value="Sign in with Ledger"/>
            </div>
            {ledgerSetupErrorMessage}
          </form>
        </div>
      }

      body = <div className="LoginPage__body">
        <div className="LoginBox__ledgerNanoHeader">
          <img src={images['ledger-logo']} className="img--noSelect" alt="Ledger Logo" width="300" height="78" />
          <img src={images['ledger-nano-s-buttons']} className="img--noSelect" alt="Ledger Nano S" width="382" height="100" />
        </div>

        <div className="LoginPage__box">
          {loginForm}
          <div className="LoginPage__notes">
            <h3>Setup instructions</h3>
            <ol>
              <li>Get a Ledger Nano S and connect it to your computer.</li>
              <li>Set up your Ledger Nano S by following instructions on the Ledger Nano site: <a href="https://www.ledgerwallet.com/start/" target="_blank" rel="nofollow noopener noreferrer">https://www.ledgerwallet.com/start/</a></li>
              <li>Install the <a href="https://www.ledgerwallet.com/apps/manager" target="_blank" rel="nofollow noopener noreferrer">Ledger Manager</a> app on your computer: <a href="https://www.ledgerwallet.com/apps/manager" target="_blank" rel="nofollow noopener noreferrer">https://www.ledgerwallet.com/apps/manager</a></li>
              <li>Inside the Ledger Manager app, go to Applications and install the Stellar app:
                <br />
                <img src={images['ledger-app']} alt="Stellar app installation inside Ledger Manager" width="355" height="77" />
              </li>
              <li>
                On your Ledger device, nagivate to the Stellar app. Press both buttons to enter the app.
                <br />
                <img src={images['ledger-nano-picture']} alt="Ledger Nano photo" width="300" height="135" />
              </li>
              <li>
                Inside the app, go to <strong>Settings</strong>, then <strong>Browser support</strong>, then select <strong>yes</strong> and press both buttons.
              </li>
            </ol>

          </div>
          <div className="LoginPage__notes">
            <h3>Notes</h3>
            <ul>
              <li>Ledger Nano S support is available on Chrome and Opera.</li>
              <li>Install the Stellar app with the <a href="https://www.ledgerwallet.com/apps/manager" target="_blank" rel="nofollow noopener noreferrer">Ledger Manager</a>.</li>
              <li>Enable browser support in the app settings.</li>
              <li>Choose the BIP32 path of the account you want use: 44'/148'/n' where n is the account index. Or use the default account 44'/148'/0'.</li>
            </ul>
          </div>
        </div>
      </div>
    }

    return <div className="so-back islandBack islandBack--t">
      <div className="island">
        <div className="island__header">
          Access your account
        </div>
        <div className="LoginPage">
          <div className="LoginPage__sidebar">
            <a className={'LoginPage__sidebar__tab' + (this.state.currentTab === 'createAccount' ? ' is-active' : '')} onClick={() => {this.setTab('createAccount')}}>
              Create account
            </a>
            <a className={'LoginPage__sidebar__tab' + (this.state.currentTab === 'login' ? ' is-active' : '')} onClick={() => {this.setTab('login')}}>
              Log in with key
            </a>
            <a className={'LoginPage__sidebar__tab' + (this.state.currentTab === 'ledger' ? ' is-active' : '')} onClick={() => {this.setTab('ledger')}}>
              <img className="LoginPage__sidebar__tab__img--invertible img--noSelect" src={images['ledger-logo']} alt="Ledger Logo" width="100" height="26" />
            </a>
          </div>
          {body}
        </div>
      </div>
    </div>
  }
}