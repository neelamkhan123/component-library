// Viewer-request function for the docs distribution (EFRJPFWGS3VYU).
//
// Before neelamui.com, one distribution served both sites out of one bucket:
// Storybook at the root and the docs under /preview. Both of those addresses
// are in the wild — in a published npm `homepage`, in READMEs, and in links
// already sent to people — so neither is allowed to start returning S3's
// AccessDenied once the bucket is restructured underneath them.
//
// Requests arriving on neelamui.com are served normally; this only rewrites
// the two retired addresses.
function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : "";
  var uri = request.uri;

  var legacyHost = host === "df22wszov2zdy.cloudfront.net";
  var legacyPath = uri === "/preview" || uri.indexOf("/preview/") === 0;

  if (!legacyHost && !legacyPath) {
    return request;
  }

  // The docs moved from /preview to the root of neelamui.com. Anything else
  // on the old distribution was Storybook, which now has its own subdomain.
  // Both branches keep the rest of the path so deep links survive.
  var target;
  if (legacyPath) {
    target = "https://neelamui.com" + (uri.substring("/preview".length) || "/");
  } else {
    target = "https://storybook.neelamui.com" + uri;
  }

  return {
    statusCode: 301,
    statusDescription: "Moved Permanently",
    headers: {
      // Storybook addresses a story entirely through ?path=, so a redirect
      // that dropped the query string would land every old story link on the
      // index instead of the story someone was actually sent.
      location: { value: target + queryString(request) },
      // Without this the redirect is cacheable indefinitely, which makes it
      // effectively impossible to retire later.
      "cache-control": { value: "max-age=3600" },
    },
  };
}

function queryString(request) {
  var parts = [];
  for (var key in request.querystring) {
    var param = request.querystring[key];
    if (param.multiValue) {
      for (var i = 0; i < param.multiValue.length; i++) {
        parts.push(key + "=" + param.multiValue[i].value);
      }
    } else if (param.value === "") {
      parts.push(key);
    } else {
      parts.push(key + "=" + param.value);
    }
  }
  return parts.length ? "?" + parts.join("&") : "";
}
