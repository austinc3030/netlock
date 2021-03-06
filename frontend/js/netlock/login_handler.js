// Require jquery
const jquery = require( 'jquery' )
window.$ = window.jQuery=jquery;

// Require path
const path = require( 'path' )

// Create the client for the server
const zerorpc = require( "zerorpc" )
let client = new zerorpc.Client( )

// Get a reference to the signin
let signin = document.querySelector( '#signin' )
let goback = document.querySelector( '#goback' )



// Constant for the progressStep
const progressStep = 'login'

// Get a reference to the main process
const remote = require( 'electron' ).remote
const mainWindow = remote.getCurrentWindow( )
const { BrowserWindow } = require('electron').remote

let loadingScreen = null
let username = null
let password = null
let password_confirm = null



// Connect to the rpc server
client.connect( "tcp://127.0.0.1:4242" )



// ****************************************************************************
// Name: nullifyLoadingScreen
// Abstract: Set the loading screen to null
// ****************************************************************************
const nullifyLoadingScreen = ( ) => {

  loadingScreen = null

} // End nullifyLoadingScreen( )



// ****************************************************************************
// Name: didFinishLoad
// Abstract: Create a loading screen
// ****************************************************************************
const didFinishLoad = ( ) => {

  loadingScreen.show( )

} // End didFinishLoad( )



// ****************************************************************************
// Name: createLoadingScreen
// Abstract: Create a loading screen
// ****************************************************************************
const createLoadingScreen = () => {

  loadingScreen = new BrowserWindow(
    Object.assign(
      {

        width:        200,
        height:       400,
        frame:        false,
        transparent:  true

      }  // End assign

    ) // End BrowserWindow

  ) // End loadingScreen

  loadingScreen.setResizable( false )

  loadingScreen.loadURL(
    require( 'url' ).format(

      {

        pathname: path.join( __dirname, '..', '..', 'pages', 'loading.html' ),
        protocol: 'file:',
        slashes: true

      } // End format

    ) // End loadURL

  ) // End loadingScreen

  loadingScreen.on( 'closed', nullifyLoadingScreen )

  loadingScreen.webContents.on('did-finish-load', didFinishLoad )

} // End createLoadingScreen



// ****************************************************************************
// Name: inputValidation
// Abstract: Validate the inputs before sending them to python
// ****************************************************************************
const inputValidation = ( ) => {

  let error = ''

  let elm_username = document.querySelector( '#username' )
  let elm_password = document.querySelector( '#password' )
  let elm_password_confirm = document.querySelector( '#password_confirm' )

  let elm_error_box = document.querySelector( '#error_box' )
  let elm_error_msg = document.querySelector( '#error_msg' )

  username = elm_username.value
  password = elm_password.value
  password_confirm = elm_password_confirm.value

  if ( !username.trim( ) ) {

    error = ' Username cannot be blank.'

  } else if ( !password.trim( ) ) {

    error = ' Password cannot be blank.'

  } else if ( !password_confirm.trim( ) ) {

    error = ' Password confirmation cannot be blank.'

  } else if ( password.trim( ) !== password_confirm.trim( ) ) {

    error = ' Passwords do not match.'

  }

  if ( error.trim( ) ) {

    elm_error_msg.innerHTML = error
    elm_error_box.className = elm_error_box.className.replace( ' invisible', ' visible' )

    console.error( error )

    return false

  } else {

    elm_error_msg.innerHTML = ''
    elm_error_box.className = elm_error_box.className.replace( ' visible', ' invisible' )

    console.log( 'Validation Passed' )

    return true

  }

} // End fsignin( )



// ****************************************************************************
// Name: fsignin
// Abstract: Move to the next page
// ****************************************************************************
const fsignin = ( ) => {

  let error_msg = ''
  let elm_error_box = document.querySelector( '#error_box' )
  let elm_error_msg = document.querySelector( '#error_msg' )

  if ( inputValidation( ) == true ) {

    createLoadingScreen( )

    // Tell the backend what step we are on
    client.invoke( "setCurrentCredentials", username, password, ( error, res ) => {

      if( error || res !== 'success' ) {

        error_msg =  ' Something went wrong trying to connect to the router. '
        error_msg += 'Are you sure you have the correct credentials? '
        error_msg += 'The error was: ' + error

        elm_error_msg.innerHTML = error_msg
        elm_error_box.className = elm_error_box.className.replace( ' invisible', ' visible' )

        console.error( error )

      } else {

        elm_error_msg.innerHTML = error_msg
        elm_error_box.className = elm_error_box.className.replace( ' visible', ' invisible' )

        mainWindow.loadURL(
          require( 'url' ).format(

            {

              pathname: path.join( __dirname, '..', '..', 'pages', 'loginnew.html' ),
              protocol: 'file:',
              slashes: true

            } // End format

          ) // End loadURL

        ) // End mainWindow

      } // End if

    } ) // End invoke( "waitTest" )

    if ( loadingScreen ) {

      loadingScreen.close( )

    } // End if

  } // End if

} // End fsignin( )



// ****************************************************************************
// Name: fgoback
// Abstract: Move to the next page
// ****************************************************************************
const fgoback = ( ) => {

  createLoadingScreen( )

  mainWindow.loadURL(
    require( 'url' ).format(

      {

        pathname: path.join( __dirname, '..', '..', 'pages', 'index.html' ),
        protocol: 'file:',
        slashes: true

      } // End format

    ) // End loadURL

  ) // End mainWindow

  if ( loadingScreen ) {

    loadingScreen.close( )

  } // End if

} // End fgoback( )



// ****************************************************************************
// Name: fsetProgressStep
// Abstract: Update the backend with the current progress step
// ****************************************************************************
const fsetProgressStep = ( ) => {

  // Tell the backend what step we are on
  client.invoke( "setProgressStep", progressStep, ( error, res ) => {

    if( error || res !== 'success' ) {

      console.error( error )

    } else {

      console.log( "Backend progress step updated successfully." )

    } // End if

  } ) // End invoke( "setProgressStep" )

} // End fsetProgressStep( )



// Add an event listener to signin
signin.addEventListener( 'click', fsignin ) // End EventListener

// Add an event listener to goback
goback.addEventListener( 'click', fgoback ) // End EventListener

// When everything is loaded, notify the backend that we are on the current step
mainWindow.webContents.once( 'did-finish-load', fsetProgressStep )