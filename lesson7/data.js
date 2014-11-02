function getData(data){
      var path=data.src;
      var request = new XMLHttpRequest();
      request.open("GET", path, false);
      request.send(null);
      return request.responseText;
}