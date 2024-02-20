[1mdiff --git a/app.json b/app.json[m
[1mindex 1c75737..ecaaf9f 100644[m
[1m--- a/app.json[m
[1m+++ b/app.json[m
[36m@@ -43,11 +43,6 @@[m
     },[m
     "updates": {[m
       "url": "https://u.expo.dev/801029ef-db83-4668-a97a-5adcc4c333e2"[m
[31m-    },[m
[31m-    "extra": {[m
[31m-      "eas": {[m
[31m-        "projectId": "801029ef-db83-4668-a97a-5adcc4c333e2"[m
[31m-      }[m
     }[m
   }[m
 }[m
[1mdiff --git a/lib/components/photoScroller.tsx b/lib/components/photoScroller.tsx[m
[1mindex 077628e..90f3b24 100644[m
[1m--- a/lib/components/photoScroller.tsx[m
[1m+++ b/lib/components/photoScroller.tsx[m
[36m@@ -70,54 +70,56 @@[m [mconst PhotoScroller = forwardRef([m
 [m
     const handleImageSelection = async (result: {[m
       canceled?: false;[m
[31m-      assets: any;[m
[32m+[m[32m      assets: any[];[m[41m [m
     }) => {[m
[31m-      const { uri } = result.assets[0];[m
[31m-      console.log("Selected image URI: ", uri);[m
[32m+[m[32m      for (const asset of result.assets) {[m
[32m+[m[32m        const { uri } = asset;[m
[32m+[m[32m        console.log("Selected image URI: ", uri);[m
 [m
[31m-      if (uri.endsWith(".heic") || uri.endsWith(".HEIC")) {[m
[31m-        const jpgUri = await convertHeicToJpg(uri);[m
[31m-        const uploadedUrl = await uploadMedia(jpgUri, "image");[m
[31m-        console.log("After URL is retrieved from upload Media ", uploadedUrl);[m
[31m-        const newMediaItem = new PhotoType({[m
[31m-          uuid: uuid.v4().toString(),[m
[31m-          type: "image",[m
[31m-          uri: uploadedUrl,[m
[31m-        });[m
[31m-        setNewMedia([...newMedia, newMediaItem]);[m
[31m-        insertImageToEditor(uploadedUrl);[m
[31m-      } else if ([m
[31m-        uri.endsWith(".jpg") ||[m
[31m-        uri.endsWith("png") ||[m
[31m-        uri.endsWith(".jpeg")[m
[31m-      ) {[m
[31m-        const uploadedUrl = await uploadMedia(uri, "image");[m
[31m-        console.log("After URL is retrieved from upload Media ", uploadedUrl);[m
[31m-        const newMediaItem = new PhotoType({[m
[31m-          uuid: uuid.v4().toString(),[m
[31m-          type: "image",[m
[31m-          uri: uploadedUrl,[m
[31m-        });[m
[31m-        setNewMedia([...newMedia, newMediaItem]);[m
[31m-        if (insertImageToEditor) {[m
[31m-          insertImageToEditor(uploadedUrl, 'Captured Image');[m
[32m+[m[32m        if (uri.endsWith(".heic") || uri.endsWith(".HEIC")) {[m
[32m+[m[32m          const jpgUri = await convertHeicToJpg(uri);[m
[32m+[m[32m          const uploadedUrl = await uploadMedia(jpgUri, "image");[m
[32m+[m[32m          console.log("After URL is retrieved from upload Media ", uploadedUrl);[m
[32m+[m[32m          const newMediaItem = new PhotoType({[m
[32m+[m[32m            uuid: uuid.v4().toString(),[m
[32m+[m[32m            type: "image",[m
[32m+[m[32m            uri: uploadedUrl,[m
[32m+[m[32m          });[m
[32m+[m[32m          setNewMedia ((prevMedia) => [...prevMedia, newMediaItem]);[m
[32m+[m[32m          insertImageToEditor(uploadedUrl);[m
[32m+[m[32m        } else if ([m
[32m+[m[32m          uri.endsWith(".jpg") ||[m
[32m+[m[32m          uri.endsWith("png") ||[m
[32m+[m[32m          uri.endsWith(".jpeg")[m
[32m+[m[32m        ) {[m
[32m+[m[32m          const uploadedUrl = await uploadMedia(uri, "image");[m
[32m+[m[32m          console.log("After URL is retrieved from upload Media ", uploadedUrl);[m
[32m+[m[32m          const newMediaItem = new PhotoType({[m
[32m+[m[32m            uuid: uuid.v4().toString(),[m
[32m+[m[32m            type: "image",[m
[32m+[m[32m            uri: uploadedUrl,[m
[32m+[m[32m          });[m
[32m+[m[32m          setNewMedia ((prevMedia) => [...prevMedia, newMediaItem]);[m
[32m+[m[32m          if (insertImageToEditor) {[m
[32m+[m[32m            insertImageToEditor(uploadedUrl, 'Captured Image');[m
[32m+[m[32m          }[m
[32m+[m[32m        } else if ([m
[32m+[m[32m          uri.endsWith(".MOV") ||[m
[32m+[m[32m          uri.endsWith(".mov") ||[m
[32m+[m[32m          uri.endsWith(".mp4")[m
[32m+[m[32m        ) {[m
[32m+[m[32m          const uploadedUrl = await uploadMedia(uri, "video");[m
[32m+[m[32m          const thumbnail = await getThumbnail(uri);[m
[32m+[m[32m          console.log("After URL is retrieved from upload Media ", uploadedUrl);[m
[32m+[m[32m          const newMediaItem = new VideoType({[m
[32m+[m[32m            uuid: uuid.v4().toString(),[m
[32m+[m[32m            type: "video",[m
[32m+[m[32m            uri: uploadedUrl,[m
[32m+[m[32m            thumbnail: thumbnail,[m
[32m+[m[32m            duration: "0:00",[m
[32m+[m[32m          });[m
[32m+[m[32m          setNewMedia ((prevMedia) => [...prevMedia, newMediaItem]);[m
         }[m
[31m-      } else if ([m
[31m-        uri.endsWith(".MOV") ||[m
[31m-        uri.endsWith(".mov") ||[m
[31m-        uri.endsWith(".mp4")[m
[31m-      ) {[m
[31m-        const uploadedUrl = await uploadMedia(uri, "video");[m
[31m-        const thumbnail = await getThumbnail(uri);[m
[31m-        console.log("After URL is retrieved from upload Media ", uploadedUrl);[m
[31m-        const newMediaItem = new VideoType({[m
[31m-          uuid: uuid.v4().toString(),[m
[31m-          type: "video",[m
[31m-          uri: uploadedUrl,[m
[31m-          thumbnail: thumbnail,[m
[31m-          duration: "0:00",[m
[31m-        });[m
[31m-        setNewMedia([...newMedia, newMediaItem]);[m
       }[m
     };[m
 [m
[1mdiff --git a/lib/screens/EditNoteScreen.tsx b/lib/screens/EditNoteScreen.tsx[m
[1mindex 98f403a..2d4048f 100644[m
[1m--- a/lib/screens/EditNoteScreen.tsx[m
[1m+++ b/lib/screens/EditNoteScreen.tsx[m
[36m@@ -95,7 +95,7 @@[m [mconst EditNoteScreen: React.FC<EditNoteScreenProps> = ({[m
     checkOwner();[m
   }, [creator]);[m
 [m
[31m-  const handleScroll = (position) => {[m
[32m+[m[32m  const handleScroll = (position: any) => {[m
     if (keyboardOpen && scrollViewRef.current) {[m
       const viewportHeight = Dimensions.get('window').height - keyboardHeight;[m
       const cursorRelativePosition = position.relativeY;[m
