/**
 * Copyright 2010-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * This file is licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License. A copy of
 * the License is located at
 *
 * http://aws.amazon.com/apache2.0/
 *
 * This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

//snippet-sourcedescription:[s3_PhotoExample.js demonstrates how to manipulate photos in albums stored in an Amazon S3 bucket.]
//snippet-service:[s3]
//snippet-keyword:[JavaScript]
//snippet-sourcesyntax:[javascript]
//snippet-keyword:[Code Sample]
//snippet-keyword:[Amazon S3]
//snippet-sourcetype:[full-example]
//snippet-sourcedate:[]
//snippet-sourceauthor:[AWS-JSDG]

// ABOUT THIS NODE.JS SAMPLE: This sample is part of the SDK for JavaScript Developer Guide topic at
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html

// snippet-start:[s3.JavaScript.photoAlbumExample.complete]
// snippet-start:[s3.JavaScript.photoAlbumExample.config]
import AWS from "aws-sdk";
///////////////
// const { CognitoIdentityClient } = require("@aws-sdk/client-cognito-identity");
// const {
//   fromCognitoIdentityPool,
// } = require("@aws-sdk/credential-provider-cognito-identity");
// const { S3Client, PutObjectCommand, ListObjectsCommand, DeleteObjectCommand, DeleteObjectsCommand } = require("@aws-sdk/client-s3");
//////////////
var albumBucketName = "charmtokensolana";
var bucketRegion = "us-east-1";
var IdentityPoolId = "us-east-1:738ee708-ea68-4bb1-b1b2-b4aa6eed4244";


AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName }
});

const bluralbumname = 'www.mytest111111.com';

var s3Blur = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: bluralbumname }
});
// snippet-end:[s3.JavaScript.photoAlbumExample.config]

// snippet-start:[s3.JavaScript.photoAlbumExample.listAlbums]


function getHtml(template) {
  return template.join('\n');
}

// window.getHTML = getHtml();


function listAlbums() {
  s3Blur.listObjects({ Delimiter: "/" }, function (err, data) {
    if (err) {
      return alert("There was an error listing your albums: " + err.message);
    } else {
      var albums = data.Contents.map(function (Contents) {
        var prefix = Contents.Key;
        var albumName = decodeURIComponent(prefix.replace("/", ""));
        console.log('data : \n', data);
        console.log('contents : \n', Contents);
        return getHtml([
          "<li>",
          `<button onClick="deleteAlbum('${albumName}')"> -X- </button>`,
          // "<button onClick=\"{ ()=> deleteAlbum('" + albumName + "') }\"> -X- </button>",
          `<button onClick="viewAlbum('${albumName}')">`,
          albumName,
          "</button>",
          "</li>",
        ]);
      });

      var message = albums.length
        ? getHtml([
          "<p>Click on an album name to view it.</p>",
          "<p>Click on the X to delete the album.</p>"
        ])
        : "<p>You do not have any albums. Please Create album.</p>";

      var htmlTemplate = [
        "<h2>Albums</h2>",
        message,
        "<ul>",
        getHtml(albums),
        "</ul>",
        // "<button", 
        // "onClick={()=>createAlbum(prompt('enter name'))}",
        // ">Create New Album2</button>",        
        `<button onClick="createAlbum(prompt('Enter Album Name:'))" >`,
        'Create New Album',
        "</button>"
      ];

      console.log("1");
      // document.getElementById("album").innerHTML = getHtml(htmlTemplate);
    }
  });
}

// window.listAlbums = listAlbums;
// snippet-end:[s3.JavaScript.photoAlbumExample.listAlbums]

// snippet-start:[s3.JavaScript.photoAlbumExample.createAlbum]
function createAlbum(albumName) {
  albumName = albumName.trim();
  if (!albumName) {
    return alert("Album names must contain at least one non-space character.");
  }
  if (albumName.indexOf("/") !== -1) {
    return alert("Album names cannot contain slashes.");
  }
  var albumKey = encodeURIComponent(albumName);
  s3.headObject({ Key: albumKey }, function (err, data) {
    if (!err) {
      return alert("Album already exists.");
    }
    if (err.code !== "NotFound") {
      return alert("There was an error creating your album: " + err.message);
    }
    s3.putObject({ Key: albumKey }, function (err, data) {
      if (err) {
        return alert("There was an error creating your album: " + err.message);
      }
      alert("Successfully created album.");
      viewAlbum(albumName);
    });
  });
}

// snippet-end:[s3.JavaScript.photoAlbumExample.createAlbum]

// snippet-start:[s3.JavaScript.photoAlbumExample.viewAlbum]
function viewAlbum(albumName) {
  var albumPhotosKey = encodeURIComponent(albumName) + "/";
  s3Blur.listObjects({ Prefix: albumPhotosKey }, function (err, data) {
    if (err) {
      return alert("There was an error viewing your album: " + err.message);
    }
    // 'this' references the AWS.Response instance that represents the response
    console.log("Viewing elements");
    // var href = this.request.httpRequest.endpoint.href;
    // var bucketUrl = href + albumBucketName + "/";

    var UrlExpireSeconds = 180 * 1;
    console.log("data.Contents S3", data.Contents);
    var photos = data.Contents.map(function (photo) {
      var photoKey = photo.Key;
      var params = {
        Bucket: bluralbumname,
        Key: photoKey,
        Expires: UrlExpireSeconds
      };

      var photoUrl = s3Blur.getSignedUrl('getObject', params);
      console.log('photoUrl S3 : ', photoUrl);
      //var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      return getHtml([
        "<span>",
        "<div>",
        '<img style="width:190px;height:128px;" src="' + photoUrl + '"/>',
        "</div>",
        "<div>",
        "<span>",
        photoKey.replace(albumPhotosKey, ""),
        "</span>",
        "</div>",
        "</span>"
      ]);
    });
    var message = photos.length
      ? "<p>Your NFT :</p>"
      : "<p>You do not have any photos in this album. Please add photos.</p>";
    var htmlTemplate = [
      "<h2>",
      "Album: " + albumName,
      "</h2>",
      message,
      "<div>",
      getHtml(photos),
      "</div>",
      // '<input id="photoupload" type="file" accept="image/*">',
      // /// make Pubkey = file
      // '<button id="addphoto" onClick="addPhoto(\'' + albumName + "')\">",
      // "Add Photo",
      // "</button>",
      '<button onClick=listAlbums() >',
      "Exit Minting process",
      "</button>"
    ];
    window.location.href="/"
    // document.getElementById("album").innerHTML = getHtml(htmlTemplate);
  });
}
function getLink(albumName, fileName) {
  var albumPhotosKey = encodeURIComponent(albumName) + "/" + encodeURIComponent(fileName) + ".png";
  s3.listObjects({ albumPhotosKey }, function (err, data) {
    if (err) {
      return alert("There was an error viewing your album: " + err.message);
    }
    // 'this' references the AWS.Response instance that represents the response
    console.log("Viewing elements");
    // var href = this.request.httpRequest.endpoint.href;
    // var bucketUrl = href + albumBucketName + "/";

    console.log("data.Contents S3", data.Contents);
    var photos = data.Contents.map(function (photo) {
      var photoKey = photo.Key;
      var params = {
        Bucket: albumBucketName,
        Key: photoKey,
      };

      var photoUrl = s3.getSignedUrl('getObject', params);
      console.log('photoUrl S3 : ', photoUrl);
      //var photoUrl = bucketUrl + encodeURIComponent(photoKey);

      return photoUrl
    });

  });
}

// snippet-end:[s3.JavaScript.photoAlbumExample.viewAlbum]

// snippet-start:[s3.JavaScript.photoAlbumExample.addPhoto]
async function addPhoto(mintPubKey, pubKey) {
  var files = document.getElementById("photoupload").files;
  if (!files.length) {
    return alert("Please choose a file to upload first.");
  }

  var file = files[0];
  var fileName = file.name;
  var albumName = pubKey;
  console.log("albumName : ", albumName);
  // const ext = fileName.lastIndexOf(".")
  // const extesion = fileName.substring(ext)
  // var photoKey = mint+extesion
  var albumPhotosKey = encodeURIComponent(albumName) + "/";
  // console.log("albumPhotosKey", albumPhotosKey);

  const ext = fileName.lastIndexOf(".")

  const extension = fileName.substring(ext)

  const key = mintPubKey + extension

  var photoKey = albumPhotosKey + key;
  console.log("photokey", photoKey);
  // Use S3 ManagedUpload class as it supports multipart uploads
  var upload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: albumBucketName,
      Key: photoKey,
      Body: file
    }
  });

  var promise = upload.promise();

  promise.then(
    function (data) {
      // alert("Successfully uploaded photo.");
      console.log('Clear Img Uploaded');
      // viewAlbum(albumName);
    },
    function (err) {
      return alert("There was an error uploading your photo: ", err.message);
    }
  );
}
async function blurAddPhoto(mintPubKey, pubKey) {
  var files = document.getElementById("photoupload").files;
  if (!files.length) {
    return alert("Please choose a file to upload first.");
  }

  var file = files[0];
  var fileName = file.name;
  var albumName = pubKey;
  console.log("albumName : \n", albumName);
  // const ext = fileName.lastIndexOf(".")
  // const extesion = fileName.substring(ext)
  // var photoKey = mint+extesion
  var albumPhotosKey = encodeURIComponent(albumName) + "/";
  console.log("albumPhotosKey :\n", albumPhotosKey);

  const ext = fileName.lastIndexOf(".")

  const extension = fileName.substring(ext)

  const key = mintPubKey + extension

  var photoKey = albumPhotosKey + key;

  var reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = () => {
    var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');
   
    var image = new Image();
    
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;

      var blurredRect = {
        x: 80,
        y: 80,
        height: 200,
        width: 200,
        spread: 25
      };

      ctx.filter = 'blur(' + blurredRect.spread + 'px)';
      // draw the canvas over itself, cropping to our required rect.

      ctx.drawImage(image, 10, 10);
      ctx.drawImage(canvas,
        blurredRect.x, blurredRect.y, blurredRect.width, blurredRect.height,
        blurredRect.x, blurredRect.y, blurredRect.width, blurredRect.height
      );
      // draw the coloring (white-ish) layer, without blur
      ctx.filter = 'none'; // remove filter
      ctx.fillStyle = 'rgba(255,255,255,0.2)';

      let url = canvas.toDataURL('image/jpeg'); 
      // console.log(url);
      url = Buffer.from(url.replace(/^data:image\/\w+;base64,/, ""),'base64')
      var upload = new AWS.S3.ManagedUpload({
        params: {
          Bucket: bluralbumname,
          Key: photoKey,
          Body: url,
          //Body: buf,
          ContentEncoding: 'base64',
          ContentType: 'image/jpeg'
        }
      });
    
      var params = {
        Bucket: bluralbumname,
        Key: photoKey,
      };
    
      s3Blur.listObjects({ albumPhotosKey }, function (err, data) {
        var photoUrl = s3Blur.getSignedUrl('getObject', params);
        console.log(" Blured Photo Url : \n",photoUrl);
        var promise = upload.promise();
        // console.log("data from S3Blur: \n", data);
        promise.then(
          (data) => {
            // debugger
            // alert("Successfully uploaded photo. and link copied");
            console.log('Blured image uploaded');
            return 
          },
          (err) => {
            return alert("There was an error uploading your photo: ", err.message);
          }
        );
      });
    };
    
    image.src = reader.result;
  };
  reader.onerror = function (error) {
    console.log('Error: ', error);
  };
}

// window.addPhoto = addPhoto;
// snippet-end:[s3.JavaScript.photoAlbumExample.addPhoto]

// snippet-start:[s3.JavaScript.photoAlbumExample.deletePhoto]
function deletePhoto(albumName, photoKey) {
  s3.deleteObject({ Key: photoKey }, function (err, data) {
    if (err) {
      return alert("There was an error deleting your photo: ", err.message);
    }
    alert("Successfully deleted photo.");
    viewAlbum(albumName);
  });
}
window.deletePhoto = deletePhoto;
// snippet-end:[s3.JavaScript.photoAlbumExample.deletePhoto]

// snippet-start:[s3.JavaScript.photoAlbumExample.deleteAlbum]
function deleteAlbum(albumName) {
  var albumKey = encodeURIComponent(albumName) + "/";

  s3.listObjects({ Prefix: albumKey }, function (err, data) {
    if (err) {
      return alert("There was an error deleting your album: ", err.message);
    }
    var objects = data.Contents.map(function (object) {
      return { Key: object.Key };
    });
    s3.deleteObjects(
      {
        Delete: { Objects: objects, Quiet: true }
      },
      function (err, data) {
        if (err) {
          return alert("There was an error deleting your album: ", err.message);
        }
        alert("Successfully deleted album.");
        listAlbums();
      }
    );
  });
}
window.deleteAlbum = deleteAlbum;
// snippet-end:[s3.JavaScript.photoAlbumExample.deleteAlbum]
// snippet-end:[s3.JavaScript.photoAlbumExample.complete]


export { deleteAlbum, deletePhoto, addPhoto, viewAlbum, createAlbum, listAlbums, getHtml, getLink, blurAddPhoto }
