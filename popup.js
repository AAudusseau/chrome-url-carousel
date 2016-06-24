'use strict';

(function() {
  var startBtn = document.getElementById('start-button');
  var stopBtn = document.getElementById('stop-button');
  var creationForm = document.getElementById('url-creation');
  var urlInput = document.getElementById('new-url');
  var list = document.getElementById('url-list');
  var intervalDurationInput = document.getElementById('interval-duration');
  var runningLabel = document.getElementById('running-label');
  var intervalDuration;
  var urls = [];

  function renderList() {
    list.innerHTML = '';
    chrome.storage.sync.get('urls', function(items) {
      urls = items.urls || [];

      urls.forEach(function(url) {
        var node = document.createElement('li');
        var textNode = document.createTextNode(url);
        var removeBtn = document.createElement('a');

        removeBtn.innerHTML = 'X';
        removeBtn.setAttribute('href', '#');
        removeBtn.setAttribute('title', 'Remove');
        removeBtn.onclick = function() {
          urls = urls.filter(function(storedUrl) {
            return storedUrl !== url;
          });
          chrome.storage.sync.set({
            urls: urls
          }, function() {
            renderList();
          });
        };

        node.appendChild(textNode);
        node.appendChild(removeBtn);
        list.appendChild(node);
      });
    });
  }

  startBtn.onclick = function() {
    chrome.storage.sync.get(['urls','intervalDuration'], function(items) {
      urls = items.urls || [];
      intervalDuration = items.intervalDuration || 1;

      chrome.tabs.query({
        currentWindow: true,
        active: true
      }, function(tab) {
        var i = 0;

        isRunning();

        chrome.runtime.getBackgroundPage(function() {
          chrome.runtime.sendMessage({
            action: 'start-carousel',
            intervalDuration: intervalDuration,
            urls: urls,
            tab: tab
          });
        });

      });
    });
  };

  stopBtn.onclick = function() {
    isNotRunning();
    chrome.runtime.getBackgroundPage(function() {
      chrome.runtime.sendMessage({
        action: 'stop-carousel'
      });
    });
  };

  creationForm.onsubmit = function(e) {
    e.preventDefault();
    urls.push(urlInput.value);
    chrome.storage.sync.set({
      urls: urls
    }, function() {
      urlInput.value = '';
      renderList();
    });
  };

  function renderIntervalDuration() {
    chrome.storage.sync.get('intervalDuration', function(items) {
      intervalDuration = items.intervalDuration || 1;
      intervalDurationInput.value = intervalDuration;
    });
  }

  intervalDurationInput.onchange = function() {
    chrome.storage.sync.set({
      intervalDuration: intervalDurationInput.value
    });
  };

  function isRunning() {
    runningLabel.style.visibility = 'visible';
    intervalDurationInput.setAttribute('disabled', '');
    urlInput.setAttribute('disabled', '');
    startBtn.setAttribute('disabled', '');
    stopBtn.removeAttribute('disabled');
  }

  function isNotRunning() {
    runningLabel.style.visibility = 'hidden';
    intervalDurationInput.removeAttribute('disabled');
    urlInput.removeAttribute('disabled');
    startBtn.removeAttribute('disabled');
    stopBtn.setAttribute('disabled', '');
  }

  function renderRunning() {
    chrome.alarms.get('url-carousel', function(alarm) {
      if (alarm) {
        isRunning();
      } else {
        isNotRunning();
      }
    });
  }

  renderList();
  renderIntervalDuration();
  renderRunning();

})();
