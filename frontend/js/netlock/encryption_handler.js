// Require jquery
const jquery = require( 'jquery' )
window.$ = window.jQuery=jquery;

// Require path
const path = require( 'path' )

// Create the client for the server
const zerorpc = require( "zerorpc" )
let client = new zerorpc.Client( )

// Get a reference to the elements we are concerned with
let next = document.querySelector( '#next' )
let goback = document.querySelector( '#goback' )



// Constant for the progressStep
const progressStep = 'encryption'

// Get a reference to the main process
const remote = require( 'electron' ).remote
const mainWindow = remote.getCurrentWindow( )
const { BrowserWindow } = require('electron').remote

let loadingScreen = null
let wpa2 = null


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

  let elm_wpa2 = document.querySelector( '#WPA2' )
  let elm_error_box = document.querySelector( '#error_box' )
  let elm_error_msg = document.querySelector( '#error_msg' )

  wpa2 = elm_wpa2.checked

  if ( wpa2 == false ) {

    error_msg =  ' We do not recommend disabling encryption on your router and therefore do not support it.'

    elm_error_msg.innerHTML = error_msg
    elm_error_box.className = elm_error_box.className.replace( ' invisible', ' visible' )

  }

  return true

} // End fsignin( )



// ****************************************************************************
// Name: fnext
// Abstract: Move to the next page
// ****************************************************************************
const fnext = ( ) => {

  if ( inputValidation( ) == true ) {

    createLoadingScreen( )

    // Tell the backend what step we are on
    client.invoke( "setEncryption", wpa2, ( error, res ) => {

      if( error || res !== 'success' ) {

        console.error( error )

      } else {

        mainWindow.loadURL(
          require( 'url' ).format(

            {

              pathname: path.join( __dirname, '..', '..', 'pages', 'thankyou.html' ),
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

  // Tell the backend what step we are on
  client.invoke( "waitTest", 0, ( error, res ) => {

    if( error || res !== 'success' ) {

      console.error( error )

    } else {
      mainWindow.loadURL(
        require( 'url' ).format(

          {

            pathname: path.join( __dirname, '..', '..', 'pages', 'feature.html' ),
            protocol: 'file:',
            slashes: true

          } // End format

        ) // End loadURL

      ) // End mainWindow

      if ( loadingScreen ) {

        loadingScreen.close( )

      } // End if

    } // End if

  } ) // End invoke( "waitTest" )

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
next.addEventListener( 'click', fnext ) // End EventListener

// Add an event listener to goback
goback.addEventListener( 'click', fgoback ) // End EventListener

// When everything is loaded, notify the backend that we are on the current step
mainWindow.webContents.once( 'did-finish-load', fsetProgressStep )
