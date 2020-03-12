if (!window.x) {
  x = {};
}

x.Selector = {};
x.Selector.getSelected = function() {
  var t = '';
  if (window.getSelection) {
    t = window.getSelection();
  } else if (document.getSelection) {
    t = document.getSelection();
  } else if (document.selection) {
    t = document.selection.createRange().text;
  }
  return t;
}

var gulHttp = function(_method, _url, _onload, _onerror, _data, _setHeaders){

  var request = new XMLHttpRequest();
  request.open(_method, _url, true);

  request.onreadystatechange = function() {
    if (this.readyState == 4){
      if((this.status == 200 || this.status == 204) && _onload  ){
        _onload(request);
      }else if(_onerror){
        console.log('onReadyError');
        _onerror(request);
      }
    }
  };

  // There was a connection error of some sort
  request.onerror = function() {
    console.log('onError');
    if(_onerror){
      _onerror(null);
    };
  };

  request.overrideMimeType("application/json");
  request.setRequestHeader("X-Requested-With", "XMLHttpRequest");

  var body = null;
  if(_method === 'POST'){
    if(_setHeaders){
      _setHeaders(request);
    }else{
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    }
    if(_data){
      body = _data;
    }
  }

  request.send(body);
};

var gulHttpGet = function(_url, _onload, _onerror){
  gulHttp('GET', _url, _onload, _onerror);
};

var gulHttpPost = function(_url, _onload, _onerror, _data, _setHeaders){
  gulHttp('POST', _url, _onload, _onerror, _data, _setHeaders);
};

// BEGIN: Save sticky note
(function($) {
    // Initilize notes when the document is ready
    $(function() {
        // Wait for server tasks
        setTimeout(function() {
            notes.init();
        }, 1000);
    });

    if(typeof $ !== 'function'){
        console.error("jQuery is not loaded!\nIt's needed to refresh Drupal views after they are changed.");
    }

    var clipboardText,
    pageSelectionX,
    pageSelectionY,
    highlightArea = document.getElementById('block-gul-content'),
    saveBtns = document.getElementsByClassName('gul-save'),
    notesTray = document.getElementById('menu-notes'),
    linksTray = document.getElementById('menu-links'),
    openNotesBtn = document.getElementsByClassName('gul-notes-open'),
    // Login Modal
    loginModalID = 'footer-login-modal',
    loginModal = document.getElementById(loginModalID),
    loginForm = document.getElementById('login-modal-form'),
    spinner = null,
    loginMessages = document.getElementById('login-modal-messages');

    if(loginForm != null){
      spinner = loginForm.getElementsByTagName('span')[0],
      loginForm.addEventListener("submit", userRegister, false);
    }

  for (var i = 0; i < saveBtns.length; i++) {
    saveBtns[i].addEventListener('click', function(ev){
      ev.preventDefault();
      // Get "node_id" if attached to "save" component: Used in stack
      var nodeId = this.getAttribute('data-node-id');
      var isUser = this.classList.contains('profile');
      // If "save" component doesn't have "node_id" attached...
      if(!nodeId){
        // ... check if it's part of billboard ...
        var billboard = findAncestor(this, 'billboard');
        if(billboard){
          // ... grab node_id from drupalSettings, which means we are saving entire page as "link"
          isUser = (drupalSettings.currentNode.bundle == 'user');
          nodeId = isUser ? drupalSettings.currentNode.uid : drupalSettings.currentNode.nid;
        }
      }

      if(nodeId){
        saveNote(nodeId, false, isUser);
      }else{
        console.warn("You can't save this item");
      }
    });
  }

  // Attach click listener to sidebar items delete button
  attachRemoveButtonsClick();

  // Highlight tooltip wrapper
  var ul = document.createElement('ul');
  ul.classList.add('gul-save-popover');
  // Highlight tooltip item: We can add more items to tooltip if needed later
  var li = document.createElement("LI");
  li.classList.add('gul-save-copy');
  // Add click listener to tooltip item
  li.addEventListener('click', saveInlineNote);
  // Add tooltip to the DOM
  ul.appendChild(li);
  document.body.appendChild(ul);

  // add toast notification
  var toast = document.createElement('div');
  toast.classList.add('gul-save-toast');
  toast.classList.add('container-full');
  var paragraph = document.createElement("p");
  paragraph.classList.add('gul-save-copy');
  paragraph.classList.add('body-2');
  toast.appendChild(paragraph);
  document.body.appendChild(toast);

  function attachRemoveButtonsClick(){
    var sidebar = document.getElementById('cbp-spmenu-s2');
    if(sidebar != null){
      // Attach click listener to entire sidebar, since we are using ajax for refreshing views
      sidebar.addEventListener('click', function (event) {
        var el = (event.target.classList.contains('gul-listing-remove')) ? event.target : null;
        // ... and call function to delete note passing the context
        if(el !== null){
            if(el.classList.contains('gul-listing-remove-confirm')){
                deleteNote.call(el, event);
            }else{
                el.classList.add('gul-listing-remove-confirm');
                var block = findAncestor(el, 'gul-listing-block');
                block.classList.add('gul-listing-remove-confirm');
            }
        }else{
            var activeDelete = sidebar.getElementsByClassName('gul-listing-remove-confirm');
            for (var j = 0; j < activeDelete.length; j++) {
                activeDelete[j].classList.remove('gul-listing-remove-confirm');
            }
        }
      }, false);
    }
  }

  function saveInlineNote(){
    ul.classList.remove("gul-show");
    if(clipboardText){
      // console.log('save text: ' + clipboardText);
      if(drupalSettings){
        saveNote(drupalSettings.currentNode.nid, true, false);
      }
    }
  }

  function toggleHighlightTooltipVisibility(event){
    if(clipboardText.trim() != ''){

      pageSelectionX = event.pageX;
      pageSelectionY = event.pageY;

      ul.style.left = pageSelectionX - 10+ 'px';
      ul.style.top = pageSelectionY - 45 + 'px';
      ul.classList.add("gul-show");
    } else {
      ul.classList.remove('gul-show');
    }
  }

  function getSelectionHtml(event) {

    if(isMobileLayout() || ( event.target && event.target.classList.contains("gul-save-copy") )){
      return false;
    }

    clipboardText = '';
    var selectedText = x.Selector.getSelected();

    if(!selectedText || !selectedText.rangeCount){
        return false;
    }

    var range = selectedText.getRangeAt(0);

    clipboardText =  range.toString();
    // console.log("Highlighted text: " + clipboardText);

    var timeout = 0;
    if(ul.classList.contains("gul-show")){
      timeout = 150;
      ul.classList.remove("gul-show")
    }

    setTimeout(function() {
      toggleHighlightTooltipVisibility(event);
    }, timeout);
  }

  if(drupalSettings && drupalSettings.currentNode && drupalSettings.currentNode.bundle != 'user'){
    highlightArea.addEventListener('mouseup', getSelectionHtml);
  }

  function saveNote(nid, inline, isUser){

    var data = [];
    if(inline){
     data.push("snippet="+encodeURIComponent(clipboardText.trim()));
    }

    var content = (data.length) ? data.join("&") : null;
    var type = isUser ? 'users' : 'notes';

    notes.save(nid, type, content).then(function(response) {
      console.log("done: %O", response);
        if(response.error) {
            paragraph.innerText = response.error;
            toast.classList.add('gul-error')
        }
        else {
            paragraph.innerText = "Your note has been saved.";
            refreshView(true);
        }

        toast.classList.add('gul-updated');
        setTimeout(function(){
            if(toast.classList.contains('gul-error')) {
                toast.classList.remove('gul-error');
            }
            toast.classList.remove('gul-updated');
        }, 2500);
    }).catch(function(error) {
      console.log(error);
      refreshView(true);
    });
  }

  function createUsersMainProfile(response, form){

    var _uid = (response.uid && response.uid.length) ? response.uid[0].value : null;

    var content = {
      uid: _uid,
      first_name: form.name.value,
      last_name: form.lastname.value
    };

    gulHttpPost(
      '/main_profile?_format=json',
      function(done) {
          if(done.response) {
              console.log("created profile: %O", JSON.parse(done.response));
          }
          document.getElementById('login-modal-form').classList.add("gul-hidden");
          showLoginMessage("Please check your inbox, we sent you an email with account confirmation");
      },
      function(err){
        showLoginMessage(JSON.parse(err.response).message);
      },
      JSON.stringify(content),
      function(request) {
        request.setRequestHeader("Content-type", "application/json");
      }
    );
  }

  function userRegister(event){
    event.preventDefault();

    var self = this;
    resetLoginMessages();

    if(!self.name.value || !self.mail.value){
      showLoginMessage("Please fill in all form data");
      return;
    }

    spinner.classList.add('spinner');

    var content = {
      name: { value: self.mail.value },
      mail: { value: self.mail.value }
    };

    console.log(content);
    //
    gulHttpPost(
      '/user/register?_format=json',
      function(done) {
          if(done.response) {
              console.log("done: %O", JSON.parse(done.response));
          }
        createUsersMainProfile(JSON.parse(done.response), self, spinner);
      },
      function(err){
        console.log("err: %O", JSON.parse(err.response));
        showLoginMessage(JSON.parse(err.response).message);
      },
      JSON.stringify(content),
      function(request) {
        request.setRequestHeader("Content-type", "application/json");
      }
    );
  }

  function showLoginMessage(message){
    if(spinner.classList.contains('spinner')){
      spinner.classList.remove('spinner');
    }

    loginMessages.innerText = message;
    if(loginMessages.classList.contains('gul-hidden')){
      loginMessages.classList.remove('gul-hidden');
    }
  }

  function resetLoginMessages(){
    loginMessages.innerText = '';
    if(loginMessages.classList.contains('gul-hidden')){
      loginMessages.classList.add('gul-hidden');
    }
  }

  function refreshView(showModal){

    if(showModal){
        var userID = null;
        if(drupalSettings.user && drupalSettings.user.uid && drupalSettings.user.uid > 0){
          userID = drupalSettings.user.uid;
        }

        if(loginModal != null && userID === null && typeof liteModal != 'undefined'){
          resetLoginMessages();
          liteModal.open(loginModalID);
        }
    }

    if(typeof $ !== 'undefined'){
      var notesView = $('[class^="js-view-dom-id-"]', notesTray),
          linksView = $('[class^="js-view-dom-id-"]', linksTray);
      notesView.trigger('RefreshView');
      // linksView.trigger('RefreshView');
    }
  }

  function deleteNote(ev){
    ev.preventDefault();

    console.log(this);

    var block = findAncestor(this, 'gul-listing-block');
    if(block != null){
        block.classList.add('gul-listing-block-collapse');
    }

    var nodeId = this.getAttribute('data-node-id'),
    flagType = this.getAttribute('data-flag-type');

    var type = flagType === 'user' ? 'users' : 'notes';
    notes.remove(nodeId, type)
    .then(function(response) {
      console.log(response);
      refreshView(false);
    }).catch(function(error) {
      console.log(error);
      refreshView(false);
    });
  }

})(typeof jQuery !== 'undefined' ? jQuery : null);

// END: Save sticky note
