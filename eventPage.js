'use strict';

(function() {

  var alarmName = 'url-carousel';

  chrome.alarms.get('url-carousel', function(alarm) {
    if (alarm) {
      chrome.alarms.onAlarm.addListener(function(alarm) {
        if (alarm.name === alarmName) {
          console.log('stay awake');
        }
      });
    }
  });

  chrome.runtime.onMessage.addListener(function (msg) {
    if (msg.action === 'start-carousel') {
      var i = 0;
      var urls = msg.urls || [];
      var tabId = msg.tab[0].id;

      chrome.alarms.create(alarmName, {
        periodInMinutes: Number(msg.intervalDuration) || 1
      });

      chrome.alarms.onAlarm.addListener(function(alarm) {
        if (alarm.name === alarmName) {
          var newUrl = urls[i % urls.length];

          chrome.tabs.update(tabId, {
            url: newUrl
          });

          i++;
        }
      });
    }

    if (msg.action === 'stop-carousel') {
      chrome.alarms.clear(alarmName);
    }
  });
})();
