var btnInitSesion = document.getElementById('logIn');
var btnCloseSession = document.getElementById('logOut');
var uploadPost = document.getElementById('uploadPost');
var messageForm = document.getElementById('message-form');
var titleInput = document.getElementById('new-post-title');
var messageInput = document.getElementById('new-post-message');
var welcome = document.getElementById('welcome');
var usuario = {};
var ref = 'usuarios';
var storageRef = firebase.storage().ref();
var imagePinterest = '';
document.getElementById('file').addEventListener('change', handleFileSelect, false);

//función del botón de iniciar sesión
btnInitSesion.addEventListener('click', function() {
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
  }).catch(function(error) {
    console.log(error);
  });
});

messageForm.onsubmit = function(e) {
  e.preventDefault();
  var text = messageInput.value;
  var title = titleInput.value;
  if (text && title)
    newPostForCurrentUser(title, text)
  messageInput.value = '';
  titleInput.value = '';
}

//function cerrar btnInitSesion
btnCloseSession.addEventListener('click', function() {
  firebase.auth().signOut();
});

function initApp() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      btnInitSesion.style.display = 'none';
      usuario = {
        nombre: user.displayName,
        email: user.email,
        img: user.photoURL,
        uid: user.uid,
      };
      btnCloseSession.style.display = 'inline-block';
      uploadPost.style.display = 'inline-block';
      welcome.style.display = 'inline-block';
      welcome.innerHTML += '<span> Bienvenido ' + usuario.nombre + '</span>';
      pushUser();
    } else {
      btnInitSesion.style.display = 'inline-block';
      btnCloseSession.style.display = 'none';
      uploadPost.style.display = 'none';
      welcome.style.display = 'none';
    }
  });
}

function showUser() {
  firebase.database().ref(ref).on('value', data => {
    console.log(data.val())
  })
}

function pushUser() {
  firebase.database().ref(ref + "/" + usuario.uid).set(usuario)
    .catch(error => {
      console.log(error)
    })
}

function newPostForCurrentUser(title, text) {
  writeNewPost(usuario.uid, usuario.nombre,
    imagePinterest, title, text);
}

function writeNewPost(uid, username, picture, title, body) {
  var metadata = {
    'contentType': picture.type
  };
  storageRef.child('images/' + picture.name).put(picture, metadata).then(function(snapshot) {
    console.log('Uploaded', snapshot.totalBytes, 'bytes.');
    console.log(snapshot.metadata);
    var url = snapshot.downloadURL;
    console.log('File available at', url);
    // A post entry.
    var postData = {
      author: username,
      uid: uid,
      body: body,
      title: title,
      authorPic: url
    };
    console.log(postData)
    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child('posts').push().key;



    // // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/posts/' + newPostKey] = postData;
    updates['/user-posts/' + uid + '/' + newPostKey] = postData;

    return firebase.database().ref().update(updates);
  }).catch(function(error) {
    // [START onfailure]
    console.error('Upload failed:', error);
    // [END onfailure]
  });
}

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  var file = evt.target.files[0];

  imagePinterest = file;
}


window.onload = function() {
  initApp();

};