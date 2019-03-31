'use strict';

const versafix = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n' +
    '<html xmlns="http://www.w3.org/1999/xhtml">\n' +
    '<head>\n' +
    '  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n' +
    '  <meta name="viewport" content="initial-scale=1.0" />\n' +
    '  <meta name="format-detection" content="telephone=no" />\n' +
    '  <title style="-ko-bind-text: @titleText">TITLE</title>\n' +
    '  <style type="text/css">\n' +
    '    @supports -ko-blockdefs {\n' +
    '      id { widget: id }\n' +
    '      size { label: Size; widget: select; options: 8|9|10|11|12|13|14|15|16|18|20|22|25|28|31; }\n' +
    '      visible { label: Visible?; widget: boolean }\n' +
    '      color { label: Color; widget: color }\n' +
    '      radius {\n' +
    '        label: Corner Radius;\n' +
    '        widget: integer;\n' +
    '        max: 20;\n' +
    '        help: Attention - this property is not supported on all email clients (i.e. Outlook)\n' +
    '      }\n' +
    '      face { label: Font; widget: select; options: Arial, Helvetica, sans-serif=Arial|Arial Black, Arial Black, Gadget, sans-serif=Arial Black|Comic Sans MS, Comic Sans MS5, cursive=Comic Sans|Courier New, Courier New, monospace=Courier|Georgia, serif=Georgia|Impact, sans-serif=Impact|Lucida Console, Monaco, monospace=Lucida Console|Lucida Sans Unicode, Lucida Grande, sans-serif=Lucida Sans Unicode|Times New Roman, Times, serif=Times New Roman|Verdana, Geneva, sans-serif=Verdana}\n' +
    '      decoration { label: Decoration; widget: select; options: none=None|underline=Underline }\n' +
    '      linksColor { label: Link Color; extend: color }\n' +
    '      linksDecoration { label: Underlined Links?; extend: decoration }\n' +
    '      buttonColor { label: Button Color; extend: color }\n' +
    '      text { label: Paragraph; widget: text }\n' +
    '      url { label: Link; widget: url }\n' +
    '      src { label: Image; widget: src }\n' +
    '      hrWidth { label: Width; widget: select; options:10|20|30|40|50|60|70|80|90|100; }\n' +
    '      hrHeight { label: Line height; widget: integer; max: 80; }\n' +
    '\n' +
    '      height { label: Height; widget: integer }\n' +
    '      imageHeight { label: Image Height; extend: height; }\n' +
    '      spacerSize { label: Height; widget: integer; max: 90; min: 4; }\n' +
    '      align { label: Alignment; widget: select; options:left=Left|right=Right|center=Center}\n' +
    '      alt {\n' +
    '        label: Alternative Text;\n' +
    '        widget: text;\n' +
    '        help: Alternative text will be shown on email clients that does not download image automatically;\n' +
    '      }\n' +
    '      sponsor { label: Sponsor; properties: visible=true; }\n' +
    '      titleText { label: HTML Title; extend: text; }\n' +
    '      gutterVisible { label: Show Gutter; extend: visible }\n' +
    '      socialIconType { label: Icon Version;widget: select; options:bw=Black and White|colors=Colors; }\n' +
    '\n' +
    '      preheaderLinkOption {\n' +
    '        label: Unsubscribe Link;\n' +
    '        widget: select;\n' +
    '        options: [LINK_PREFERENCES]=Preferences|[LINK_UNSUBSCRIBE]=Unsubscribe|none=None;\n' +
    '        help: If -None- is selected, preHeader text will be shown;\n' +
    '      }\n' +
    '\n' +
    '      hrStyle { label: Separator Style;properties:color hrWidth hrHeight; }\n' +
    '      hrStyle:preview { height: 200%; width: 200%; bottom: 20px; -ko-border-bottom: @[hrHeight]px solid @color; }\n' +
    '      preheaderVisible { label: Show Preheader; extend: visible; help: Preheader block is the first one on the top of the page. It contains web version link and optionally unsubscribe link or a preheader text that will be shown as a preview on some email clients; }\n' +
    '\n' +
    '      /* content types */\n' +
    '      blocks { label: Blocks; properties: blocks[]; }\n' +
    '      link { label: Link; properties: text url }\n' +
    '      image { label: Image; properties: src url alt }\n' +
    '      backgroundColor { label: Background Color; extend: color }\n' +
    '      buttonLink { label: Button; extend: link }\n' +
    '\n' +
    '      /* texts and links */\n' +
    '      textStyle { label: Text; properties: face color size }\n' +
    '      textStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\n' +
    '      linkStyle { label: Link; properties: face color size decoration=none }\n' +
    '      linkStyle:preview { -ko-bind-text: @[\'Link\']; -ko-font-size: @[size]px; -ko-font-family: @face; -ko-color: @color; -ko-text-decoration: @[decoration] }\n' +
    '      longTextStyle { label: Paragraph; properties: face color size linksColor   }\n' +
    '      longTextStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\n' +
    '      bigButtonStyle { label: Big Button; extend: buttonStyle }\n' +
    '      titleTextStyle { label: Title; extend: textStyle }\n' +
    '      /* background */\n' +
    '      externalBackgroundColor { label: External Background; extend: color }\n' +
    '\n' +
    '      externalTextStyle { label: Alternative Text; extend: textStyle }\n' +
    '      externalTextStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\n' +
    '\n' +
    '      bigTitleStyle { label: Title; properties: face color size align}\n' +
    '      bigTitleStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\n' +
    '      /* buttons */\n' +
    '      buttonStyle color { label: Text Color; extend: color }\n' +
    '      buttonStyle size { label: Text Size; extend: size }\n' +
    '      buttonStyle { label: Button; properties: face color size buttonColor radius }\n' +
    '      buttonStyle:preview { -ko-bind-text: @[\'Button\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; -ko-background-color: @buttonColor; padding-left: 5px; -ko-border-radius: @[radius]px; }\n' +
    '\n' +
    '      /* contents */\n' +
    '      preheaderText {label: PreHeader Text; extend:text; help: This text will be shown on some email clients as a preview of the email contents;}\n' +
    '      leftImage { label: Left Image; extend: image }\n' +
    '      leftLongText { label: Left Text; extend: text }\n' +
    '      leftButtonLink { label: Left Button; extend: buttonLink }\n' +
    '      middleImage { label: Central Image; extend: image }\n' +
    '      middleLongText { label: Central Text; extend: text }\n' +
    '      middleButtonLink { label: Central Button; extend: buttonLink }\n' +
    '      rightImage { label: Right Image; extend: image }\n' +
    '      rightLongText { label: Right Text; extend: text }\n' +
    '      rightButtonLink { label: Right Button; extend: buttonLink }\n' +
    '      webversionText{ label: Web Link Text; extend: text;}\n' +
    '      unsubscribeText{ label: Unsubscribe Link; extend: text;}\n' +
    '\n' +
    '      titleVisible { label: Show Title; extend: visible; }\n' +
    '      buttonVisible { label: Show Button; extend: visible; }\n' +
    '      imageVisible { label: Show Image; extend: visible; }\n' +
    '\n' +
    '      contentTheme { label: Main Style; }\n' +
    '      contentTheme:preview { -ko-background-color: @[backgroundColor] }\n' +
    '      frameTheme { label: Frame Style; }\n' +
    '      frameTheme:preview { -ko-background-color: @[backgroundColor] }\n' +
    '      template preheaderText { label: Preheader; }\n' +
    '\n' +
    '      template { label: Page; theme: frameTheme ;properties:  preheaderVisible=true; version: 1.0.6; }\n' +
    '\n' +
    '      footerBlock { label: Unsubscribe Block; theme: frameTheme }\n' +
    '\n' +
    '      socialBlock fbVisible { label: Facebook; }\n' +
    '      socialBlock twVisible { label: Twitter }\n' +
    '      socialBlock ggVisible { label: Google+ }\n' +
    '      socialBlock inVisible { label: LinkedIn }\n' +
    '      socialBlock flVisible { label: Flickr }\n' +
    '      socialBlock viVisible { label: Vimeo }\n' +
    '      socialBlock webVisible { label: Website }\n' +
    '      socialBlock instVisible { label: Instagram }\n' +
    '      socialBlock youVisible { label: YouTube }\n' +
    '      socialBlock fbUrl { label: Facebook Link}\n' +
    '      socialBlock twUrl { label: Twitter Link}\n' +
    '      socialBlock ggUrl { label: Google+ Link}\n' +
    '      socialBlock inUrl { label: LinkedIn Link}\n' +
    '      socialBlock flUrl { label: Flickr Link}\n' +
    '      socialBlock viUrl { label: Vimeo Link}\n' +
    '      socialBlock webUrl { label: Website Link}\n' +
    '      socialBlock instUrl { label: Instagram Link}\n' +
    '      socialBlock youUrl { label: YouTube Link}\n' +
    '      socialBlock {\n' +
    '        label: Social Block;\n' +
    '        properties: socialIconType=colors fbVisible=true fbUrl twVisible=true twUrl ggVisible=true ggUrl webVisible=false webUrl inVisible=false inUrl flVisible=false flUrl viVisible=false viUrl instVisible=false instUrl youVisible=false youUrl longTextStyle longText backgroundColor;\n' +
    '        variant:socialIconType;\n' +
    '        theme: frameTheme\n' +
    '      }\n' +
    '\n' +
    '      preheaderBlock { label:Preheader Block;  theme: frameTheme}\n' +
    '\n' +
    '      sideArticleBlock imagePos {label:Image position;widget:select; options: left=Left|right=Right; }\n' +
    '      sideArticleBlock imageWidth { label: Image Size; widget: select; options: 120=Small|166=Medium|258=Big; }\n' +
    '      sideArticleBlock { label: Image+Text Block; properties: backgroundColor titleVisible=true buttonVisible=true imageWidth=166 imagePos=left titleTextStyle longTextStyle buttonStyle  image  longText buttonLink; variant:imagePos; theme: contentTheme }\n' +
    '\n' +
    '      textBlock { label: Text Block; properties: backgroundColor longTextStyle longText; theme: contentTheme}\n' +
    '\n' +
    '      singleArticleBlock { label: Image/Text Block; properties: backgroundColor titleVisible=true buttonVisible=true imageVisible=true titleTextStyle longTextStyle buttonStyle  image  longText buttonLink;theme: contentTheme}\n' +
    '\n' +
    '      doubleArticleBlock { label: 2 Columns Block; properties: backgroundColor titleVisible=true buttonVisible=true imageVisible=true titleTextStyle longTextStyle buttonStyle  leftImage  leftLongText leftButtonLink rightImage  rightLongText rightButtonLink; theme: contentTheme}\n' +
    '\n' +
    '      tripleArticleBlock { label: 3 Columns Block; properties: backgroundColor titleVisible=true buttonVisible=true imageVisible=true titleTextStyle longTextStyle buttonStyle  leftImage  leftLongText leftButtonLink middleImage  middleLongText middleButtonLink rightImage  rightLongText rightButtonLink; theme: contentTheme}\n' +
    '\n' +
    '      logoBlock imageWidth { label: Image Size; widget: select; options: 166=Small|258=Medium|350=Big; variant:imageWidth;}\n' +
    '      logoBlock { label: Logo Block; properties: image imageWidth=258; variant: imageWidth; theme: contentTheme}\n' +
    '\n' +
    '      titleBlock { label: Title; theme: contentTheme}\n' +
    '\n' +
    '      imageBlock longTextStyle {\n' +
    '        label: Alternative Text;\n' +
    '      }\n' +
    '      imageBlock { label: Image; properties: gutterVisible=false; variant: gutterVisible; theme: contentTheme }\n' +
    '\n' +
    '      doubleImageBlock longTextStyle {\n' +
    '        label: Alternative Text;\n' +
    '      }\n' +
    '      doubleImageBlock { label: Two Image Gallery Block; properties: gutterVisible=false; variant: gutterVisible; theme: contentTheme }\n' +
    '\n' +
    '      tripleImageBlock longTextStyle {\n' +
    '        label: Alternative Text;\n' +
    '      }\n' +
    '      tripleImageBlock { label: Three Image Gallery Block;properties:gutterVisible=false;variant:gutterVisible; theme: contentTheme}\n' +
    '\n' +
    '      buttonBlock { label: Button Block; theme: contentTheme}\n' +
    '      hrBlock { label: Separator Block;  theme: contentTheme}\n' +
    '      spacerBlock { label: Spacer Block;  theme: contentTheme}\n' +
    '\n' +
    '      spacerBlock:preview,\n' +
    '      logoBlock:preview { -ko-background-color: @[externalBackgroundColor] }\n' +
    '\n' +
    '      preheaderBlock:preview,\n' +
    '      hrBlock:preview,\n' +
    '      sideArticleBlock:preview,\n' +
    '      textBlock:preview,\n' +
    '      singleArticleBlock:preview,\n' +
    '      doubleArticleBlock:preview,\n' +
    '      tripleArticleBlock:preview,\n' +
    '      titleBlock:preview,\n' +
    '      footerBlock:preview,\n' +
    '      socialBlock:preview,\n' +
    '      buttonBlock:preview,\n' +
    '      titleBlock:preview,\n' +
    '      socialshareBlock:preview { -ko-background-color: @[backgroundColor] }\n' +
    '    }\n' +
    '  </style>\n' +
    '  <style type="text/css" data-inline="true">\n' +
    '    body { Margin: 0; padding: 0; }\n' +
    '    img { border: 0px; display: block; }\n' +
    '\n' +
    '    .socialLinks { font-size: 6px; }\n' +
    '    .socialLinks a {\n' +
    '      display: inline-block;\n' +
    '    }\n' +
    '    .socialIcon {\n' +
    '      display: inline-block;\n' +
    '      vertical-align: top;\n' +
    '      padding-bottom: 0px;\n' +
    '      border-radius: 100%;\n' +
    '    }\n' +
    '    .oldwebkit { max-width: 570px; }\n' +
    '    td.vb-outer { padding-left: 9px; padding-right: 9px; }\n' +
    '    table.vb-container, table.vb-row, table.vb-content {\n' +
    '      border-collapse: separate;\n' +
    '    }\n' +
    '    table.vb-row {\n' +
    '      border-spacing: 9px;\n' +
    '    }\n' +
    '    table.vb-row.halfpad {\n' +
    '      border-spacing: 0;\n' +
    '      padding-left: 9px;\n' +
    '      padding-right: 9px;\n' +
    '    }\n' +
    '    table.vb-row.fullwidth {\n' +
    '      border-spacing: 0;\n' +
    '      padding: 0;\n' +
    '    }\n' +
    '    table.vb-container {\n' +
    '      padding-left: 18px;\n' +
    '      padding-right: 18px;\n' +
    '    }\n' +
    '    table.vb-container.fullpad {\n' +
    '      border-spacing: 18px;\n' +
    '      padding-left: 0;\n' +
    '      padding-right: 0;\n' +
    '    }\n' +
    '    table.vb-container.halfpad {\n' +
    '      border-spacing: 9px;\n' +
    '      padding-left: 9px;\n' +
    '      padding-right: 9px;\n' +
    '    }\n' +
    '    table.vb-container.fullwidth {\n' +
    '      padding-left: 0;\n' +
    '      padding-right: 0;\n' +
    '    }\n' +
    '  </style>\n' +
    '  <style type="text/css">\n' +
    '    /* yahoo, hotmail */\n' +
    '    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }\n' +
    '    .yshortcuts a { border-bottom: none !important; }\n' +
    '    .vb-outer { min-width: 0 !important; }\n' +
    '    .RMsgBdy, .ExternalClass {\n' +
    '      width: 100%;\n' +
    '      background-color: #3f3f3f;\n' +
    '      -ko-background-color: @[_theme_.frameTheme.backgroundColor]\n' +
    '    }\n' +
    '\n' +
    '    /* outlook */\n' +
    '    table { mso-table-rspace: 0pt; mso-table-lspace: 0pt; }\n' +
    '    #outlook a { padding: 0; }\n' +
    '    img { outline: none; text-decoration: none; border: none; -ms-interpolation-mode: bicubic; }\n' +
    '    a img { border: none; }\n' +
    '\n' +
    '    @media screen and (max-device-width: 600px), screen and (max-width: 600px) {\n' +
    '      table.vb-container, table.vb-row {\n' +
    '        width: 95% !important;\n' +
    '      }\n' +
    '\n' +
    '      .mobile-hide { display: none !important; }\n' +
    '      .mobile-textcenter { text-align: center !important; }\n' +
    '\n' +
    '      .mobile-full {\n' +
    '        float: none !important;\n' +
    '        width: 100% !important;\n' +
    '        max-width: none !important;\n' +
    '        padding-right: 0 !important;\n' +
    '        padding-left: 0 !important;\n' +
    '      }\n' +
    '      img.mobile-full {\n' +
    '        width: 100% !important;\n' +
    '        max-width: none !important;\n' +
    '        height: auto !important;\n' +
    '      }\n' +
    '    }\n' +
    '  </style>\n' +
    '  <style type="text/css" data-inline="true">\n' +
    '    [data-ko-block=tripleArticleBlock] .links-color a,\n' +
    '    [data-ko-block=tripleArticleBlock] .links-color a:link,\n' +
    '    [data-ko-block=tripleArticleBlock] .links-color a:visited,\n' +
    '    [data-ko-block=tripleArticleBlock] .links-color a:hover {\n' +
    '      color: #3f3f3f;\n' +
    '      -ko-color: @longTextStyle.linksColor;\n' +
    '      text-decoration: underline;\n' +
    '    }\n' +
    '    [data-ko-block=tripleArticleBlock] .long-text p { Margin: 1em 0px; }\n' +
    '    [data-ko-block=tripleArticleBlock] .long-text p:last-child { Margin-bottom: 0px; }\n' +
    '    [data-ko-block=tripleArticleBlock] .long-text p:first-child { Margin-top: 0px; }\n' +
    '\n' +
    '    [data-ko-block=doubleArticleBlock] .links-color a,\n' +
    '    [data-ko-block=doubleArticleBlock] .links-color a:link,\n' +
    '    [data-ko-block=doubleArticleBlock] .links-color a:visited,\n' +
    '    [data-ko-block=doubleArticleBlock] .links-color a:hover {\n' +
    '      color: #3f3f3f;\n' +
    '      -ko-color: @longTextStyle.linksColor;\n' +
    '      text-decoration: underline;\n' +
    '    }\n' +
    '    [data-ko-block=doubleArticleBlock] .long-text p { Margin: 1em 0px; }\n' +
    '    [data-ko-block=doubleArticleBlock] .long-text p:last-child { Margin-bottom: 0px; }\n' +
    '    [data-ko-block=doubleArticleBlock] .long-text p:first-child { Margin-top: 0px; }\n' +
    '\n' +
    '    [data-ko-block=singleArticleBlock] .links-color a,\n' +
    '    [data-ko-block=singleArticleBlock] .links-color a:link,\n' +
    '    [data-ko-block=singleArticleBlock] .links-color a:visited,\n' +
    '    [data-ko-block=singleArticleBlock] .links-color a:hover {\n' +
    '      color: #3f3f3f;\n' +
    '      -ko-color: @longTextStyle.linksColor;\n' +
    '      text-decoration: underline;\n' +
    '    }\n' +
    '    [data-ko-block=singleArticleBlock] .long-text p { Margin: 1em 0px; }\n' +
    '    [data-ko-block=singleArticleBlock] .long-text p:last-child { Margin-bottom: 0px; }\n' +
    '    [data-ko-block=singleArticleBlock] .long-text p:first-child { Margin-top: 0px; }\n' +
    '\n' +
    '    [data-ko-block=textBlock] .links-color a,\n' +
    '    [data-ko-block=textBlock] .links-color a:link,\n' +
    '    [data-ko-block=textBlock] .links-color a:visited,\n' +
    '    [data-ko-block=textBlock] .links-color a:hover {\n' +
    '      color: #3f3f3f;\n' +
    '      -ko-color: @longTextStyle.linksColor;\n' +
    '      text-decoration: underline;\n' +
    '    }\n' +
    '    [data-ko-block=textBlock] .long-text p { Margin: 1em 0px; }\n' +
    '    [data-ko-block=textBlock] .long-text p:last-child { Margin-bottom: 0px; }\n' +
    '    [data-ko-block=textBlock] .long-text p:first-child { Margin-top: 0px; }\n' +
    '\n' +
    '    [data-ko-block=sideArticleBlock] .links-color a,\n' +
    '    [data-ko-block=sideArticleBlock] .links-color a:link,\n' +
    '    [data-ko-block=sideArticleBlock] .links-color a:visited,\n' +
    '    [data-ko-block=sideArticleBlock] .links-color a:hover {\n' +
    '      color: #3f3f3f;\n' +
    '      -ko-color: @longTextStyle.linksColor;\n' +
    '      text-decoration: underline;\n' +
    '    }\n' +
    '    [data-ko-block=sideArticleBlock] .long-text p { Margin: 1em 0px; }\n' +
    '    [data-ko-block=sideArticleBlock] .long-text p:last-child { Margin-bottom: 0px; }\n' +
    '    [data-ko-block=sideArticleBlock] .long-text p:first-child { Margin-top: 0px; }\n' +
    '\n' +
    '    [data-ko-block=socialBlock] .links-color a,\n' +
    '    [data-ko-block=socialBlock] .links-color a:link,\n' +
    '    [data-ko-block=socialBlock] .links-color a:visited,\n' +
    '    [data-ko-block=socialBlock] .links-color a:hover {\n' +
    '      color: #cccccc;\n' +
    '      -ko-color: @longTextStyle.linksColor;\n' +
    '      text-decoration: underline;\n' +
    '    }\n' +
    '    [data-ko-block=socialBlock] .long-text p { Margin: 1em 0px; }\n' +
    '    [data-ko-block=socialBlock] .long-text p:last-child { Margin-bottom: 0px; }\n' +
    '    [data-ko-block=socialBlock] .long-text p:first-child { Margin-top: 0px; }\n' +
    '\n' +
    '    [data-ko-block=footerBlock] .links-color a,\n' +
    '    [data-ko-block=footerBlock] .links-color a:link,\n' +
    '    [data-ko-block=footerBlock] .links-color a:visited,\n' +
    '    [data-ko-block=footerBlock] .links-color a:hover {\n' +
    '      color: #cccccc;\n' +
    '      -ko-color: @longTextStyle.linksColor;\n' +
    '      text-decoration: underline;\n' +
    '    }\n' +
    '    [data-ko-block=footerBlock] .long-text p { Margin: 1em 0px; }\n' +
    '    [data-ko-block=footerBlock] .long-text p:last-child { Margin-bottom: 0px; }\n' +
    '    [data-ko-block=footerBlock] .long-text p:first-child { Margin-top: 0px; }\n' +
    '\n' +
    '    [data-ko-block=doubleImageBlock] a,\n' +
    '    [data-ko-block=doubleImageBlock] a:link,\n' +
    '    [data-ko-block=doubleImageBlock] a:visited,\n' +
    '    [data-ko-block=doubleImageBlock] a:hover {\n' +
    '      color: #3f3f3f;\n' +
    '      -ko-color: @longTextStyle.linksColor;\n' +
    '      text-decoration: underline;\n' +
    '    }\n' +
    '    [data-ko-block=tripleImageBlock] a,\n' +
    '    [data-ko-block=tripleImageBlock] a:link,\n' +
    '    [data-ko-block=tripleImageBlock] a:visited,\n' +
    '    [data-ko-block=tripleImageBlock] a:hover {\n' +
    '      color: #3f3f3f;\n' +
    '      -ko-color: @longTextStyle.linksColor;\n' +
    '      text-decoration: underline;\n' +
    '    }\n' +
    '    [data-ko-block=imageBlock] a,\n' +
    '    [data-ko-block=imageBlock] a:link,\n' +
    '    [data-ko-block=imageBlock] a:visited,\n' +
    '    [data-ko-block=imageBlock] a:hover {\n' +
    '      color: #3f3f3f;\n' +
    '      -ko-color: @longTextStyle.linksColor;\n' +
    '      text-decoration: underline;\n' +
    '    }\n' +
    '  </style>\n' +
    '</head>\n' +
    '<body bgcolor="#3f3f3f" text="#919191" alink="#cccccc" vlink="#cccccc" style="background-color: #3f3f3f; color: #919191;\n' +
    '  -ko-background-color: @_theme_.frameTheme.backgroundColor; -ko-attr-bgcolor: @_theme_.frameTheme.backgroundColor; -ko-color: @_theme_.frameTheme.longTextStyle.color;\n' +
    '  -ko-attr-text: @_theme_.frameTheme.longTextStyle.color; -ko-attr-alink: @_theme_.frameTheme.longTextStyle.linksColor;\n' +
    '  -ko-attr-vlink: @_theme_.frameTheme.longTextStyle.linksColor">\n' +
    '\n' +
    '  <center>\n' +
    '\n' +
    '  <!-- preheaderBlock -->\n' +
    '  <div data-ko-display="preheaderVisible" data-ko-wrap="false">\n' +
    '\n' +
    '  <table class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#3f3f3f"\n' +
    '    style="background-color: #3f3f3f; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor" data-ko-block="preheaderBlock">\n' +
    '    <tr>\n' +
    '      <td class="vb-outer" align="center" valign="top" bgcolor="#3f3f3f"\n' +
    '        style="background-color: #3f3f3f; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor">\n' +
    '        <div style="display: none; font-size:1px; color: #333333; line-height: 1px; max-height:0px; max-width: 0px; opacity: 0; overflow: hidden;\n' +
    '          -ko-bind-text: @preheaderText"></div>\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]-->\n' +
    '        <div class="oldwebkit">\n' +
    '        <table width="570" border="0" cellpadding="0" cellspacing="0" class="vb-row halfpad" bgcolor="#3f3f3f"\n' +
    '          style="width: 100%; max-width: 570px; background-color: #3f3f3f; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;">\n' +
    '          <tr>\n' +
    '            <td align="center" valign="top" bgcolor="#3f3f3f" style="font-size: 0; background-color: #3f3f3f;\n' +
    '              -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor" align="left">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="552"><tr><![endif]-->\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="276"><![endif]-->\n' +
    '<div style="display:inline-block; max-width:276px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '                    <table class="vb-content" border="0" cellspacing="9" cellpadding="0" width="276" style="width: 100%;" align="left">\n' +
    '                      <tr>\n' +
    '                        <td width="100%" valign="top" align="left" style="font-weight: normal; text-align:left; font-size: 13px;\n' +
    '                          font-family: Arial, Helvetica, sans-serif; color: #ffffff;\n' +
    '                          -ko-font-size: @[linkStyle.size]px; -ko-color: @linkStyle.color; -ko-font-family: @linkStyle.face">\n' +
    '                          <a data-ko-display="preheaderLinkOption neq \'none\'" data-ko-editable="unsubscribeText" href="[LINK_PREFERENCES]"\n' +
    '                             style="text-decoration: underline; color: #ffffff; -ko-attr-href: @preheaderLinkOption;\n' +
    '                             -ko-color: @linkStyle.color; -ko-text-decoration: @linkStyle.decoration">Preferences</a>\n' +
    '                          <span data-ko-display="preheaderLinkOption eq \'none\'" style="font-size: 13px;color: #919191; font-weight: normal; text-align:center;\n' +
    '                            font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color;\n' +
    '                            -ko-font-family: @longTextStyle.face; -ko-bind-text: @preheaderText; display: none"></span>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                    </table>\n' +
    '</div><!--[if (gte mso 9)|(lte ie 8)]>\n' +
    '</td><td align="left" valign="top" width="276">\n' +
    '<![endif]--><div style="display:inline-block; max-width:276px; vertical-align:top; width:100%;" class="mobile-full mobile-hide">\n' +
    '\n' +
    '                    <table class="vb-content" border="0" cellspacing="9" cellpadding="0" width="276" style="width: 100%; text-align: right;" align="left">\n' +
    '                      <tr>\n' +
    '                        <td width="100%" valign="top" style="font-weight: normal;  font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #ffffff;\n' +
    '                      -ko-font-size: @[linkStyle.size]px; -ko-color: @linkStyle.color; -ko-font-family: @linkStyle.face">\n' +
    '                      <span style="color: #ffffff; text-decoration: underline;\n' +
    '                        -ko-color: @linkStyle.color; -ko-text-decoration: @linkStyle.decoration">\n' +
    '                          <a data-ko-editable="webversionText" href="[LINK_BROWSER]"\n' +
    '                          style="text-decoration: underline; color: #ffffff;\n' +
    '                           -ko-color: @linkStyle.color; -ko-text-decoration: @linkStyle.decoration">View in your browser</a>\n' +
    '                         </span>\n' +
    '                       </td>\n' +
    '                      </tr>\n' +
    '                    </table>\n' +
    '\n' +
    '</div><!--[if (gte mso 9)|(lte ie 8)]>\n' +
    '</td></tr></table><![endif]-->\n' +
    '\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        </div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '\n' +
    '  </div>\n' +
    '  <!-- /preheaderBlock -->\n' +
    '\n' +
    '  <div data-ko-container="main" data-ko-wrap="false">\n' +
    '\n' +
    '  <!-- logoBlock -->\n' +
    '  <table class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf"\n' +
    '    style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor" data-ko-block="logoBlock">\n' +
    '    <tr>\n' +
    '      <td class="vb-outer" align="center" valign="top" bgcolor="#bfbfbf"\n' +
    '        style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]-->\n' +
    '        <div class="oldwebkit">\n' +
    '        <table width="570" style="width: 100%; max-width: 570px" border="0" cellpadding="0" cellspacing="18" class="vb-container fullpad">\n' +
    '          <tr>\n' +
    '            <td valign="top" align="center">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="258" style="-ko-attr-width: @[imageWidth]"><tr><td align="center" valign="top"><![endif]-->\n' +
    '<div style="display:inline-block; max-width:258px; -ko-max-width: @[imageWidth]px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '                    <a data-ko-link="image.url" href="" style="font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #f3f3f3;\n' +
    '                      text-decoration: none; -ko-font-size: @[externalTextStyle.size]px;\n' +
    '                      -ko-font-family: @externalTextStyle.face; -ko-color: @externalTextStyle.color"><img\n' +
    '                       data-ko-editable="image.src" width="258" data-ko-placeholder-height="150"\n' +
    '                        style="-ko-attr-alt: @image.alt; width: 100%; max-width: 258px; -ko-attr-width: @imageWidth; -ko-max-width: @[imageWidth]px;"\n' +
    '                        src="[PLACEHOLDER_258x150]" vspace="0" hspace="0" border="0" alt="" /></a>\n' +
    '</div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        </div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <!-- /logoBlock  -->\n' +
    '\n' +
    '  <!-- sideArticleBlock  -->\n' +
    '  <table class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf"\n' +
    '    style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor" data-ko-block="sideArticleBlock">\n' +
    '    <tr>\n' +
    '      <td class="vb-outer" align="center" valign="top" bgcolor="#bfbfbf"\n' +
    '        style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]-->\n' +
    '        <div class="oldwebkit">\n' +
    '        <table width="570" border="0" cellpadding="0" cellspacing="9" class="vb-row fullpad" bgcolor="#ffffff"\n' +
    '          style="width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;">\n' +
    '          <tr>\n' +
    '            <td align="center" class="mobile-row" valign="top" style="font-size: 0;">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="552"><tr><![endif]-->\n' +
    '<div data-ko-display="imagePos eq \'left\'" data-ko-wrap="false" style="width: 100%; max-width:184px; -ko-max-width:@[18 + Math.round(imageWidth)]px; display:inline-block" class="mobile-full">\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="184" style="-ko-attr-width: @[18 + Math.round(imageWidth)]"><![endif]-->\n' +
    '<div style="display:inline-block; max-width:184px; -ko-max-width:@[18 + Math.round(imageWidth)]px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '\n' +
    '                    <table class="vb-content" border="0" cellspacing="9" cellpadding="0" width="184" style="width: 100%; -ko-attr-width: @[18 + Math.round(imageWidth)]" align="left">\n' +
    '                      <tr>\n' +
    '                        <td width="100%" valign="top" align="left" class="links-color">\n' +
    '                          <a data-ko-link="image.url" href="">\n' +
    '                            <img data-ko-editable="image.src" border="0" hspace="0" vspace="0" width="166"\n' +
    '                              data-ko-placeholder-height="130" class="mobile-full" alt=""\n' +
    '                              src="[PLACEHOLDER_166x130]"\n' +
    '                              style="vertical-align: top; width: 100%; height: auto; -ko-attr-width: @imageWidth; max-width: 166px; -ko-max-width: @[imageWidth]px; -ko-attr-alt: @image.alt" />\n' +
    '                          </a>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                    </table>\n' +
    '\n' +
    '</div><!--[if (gte mso 9)|(lte ie 8)]></td>\n' +
    '<![endif]--></div><!--[if (gte mso 9)|(lte ie 8)]>\n' +
    '<td align="left" valign="top" width="368" style="-ko-attr-width: @[570 - 2 * 18 - Math.round(imageWidth)]">\n' +
    '<![endif]--><div style="display:inline-block; max-width:368px; -ko-max-width: @[570 - 2 * 18 - Math.round(imageWidth)]px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '\n' +
    '                    <table class="vb-content" border="0" cellspacing="9" cellpadding="0" width="368" style="width: 100%; -ko-attr-width: @[570 - 2 * 18 - Math.round(imageWidth)]" align="left">\n' +
    '                      <tr data-ko-display="titleVisible">\n' +
    '                        <td style="font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\n' +
    '                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color">\n' +
    '                          <span style="color: #3f3f3f; -ko-color: @titleTextStyle.color" data-ko-editable="titleText">\n' +
    '                          Title\n' +
    '                          </span>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr>\n' +
    '                        <td align="left" style="text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\n' +
    '                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color"\n' +
    '                          data-ko-editable="longText" class="long-text links-color">\n' +
    '                          <p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr data-ko-display="buttonVisible">\n' +
    '                        <td valign="top">\n' +
    '                          <table cellpadding="0" border="0" align="left" cellspacing="0" class="mobile-full" style="padding-top: 4px">\n' +
    '                            <tr>\n' +
    '                              <td width="auto" valign="middle" bgcolor="#bfbfbf" align="center" height="26"\n' +
    '                                style="font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\n' +
    '                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\n' +
    '                                -ko-border-radius: @[buttonStyle.radius]px;\n' +
    '                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\n' +
    '                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color;">\n' +
    '                                <a data-ko-editable="buttonLink.text" href="" style="text-decoration: none; color: #3f3f3f; font-weight: normal;\n' +
    '                                  -ko-color: @buttonStyle.color; -ko-attr-href: @buttonLink.url">BUTTON</a>\n' +
    '                              </td>\n' +
    '                            </tr>\n' +
    '                          </table>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                    </table>\n' +
    '</div><!--[if (gte mso 9)|(lte ie 8)]></td>\n' +
    '<![endif]--><div data-ko-display="imagePos eq \'right\'" data-ko-wrap="false" style="width: 100%; max-width:184px; -ko-max-width:@[18 + Math.round(imageWidth)]px; display:inline-block; display: none;" class="mobile-full"><!--[if (gte mso 9)|(lte ie 8)]>\n' +
    '<td data-ko-display="imagePos eq \'right\'" align="left" valign="top" width="184" style="display: none; -ko-attr-width: @[18 + Math.round(imageWidth)]">\n' +
    '<![endif]--><div style="display:inline-block; max-width:184px; -ko-max-width:@[18 + Math.round(imageWidth)]px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '\n' +
    '                    <table class="vb-content" border="0" cellspacing="9" cellpadding="0" width="184" style="width: 100%; -ko-attr-width: @[18 + Math.round(imageWidth)]" align="left">\n' +
    '                      <tr>\n' +
    '                        <td width="100%" valign="top" align="left" class="links-color">\n' +
    '                          <a data-ko-link="image.url" href="">\n' +
    '                            <img data-ko-editable="image.src" border="0" hspace="0" vspace="0" width="166" data-ko-placeholder-height="130" class="mobile-full"\n' +
    '                              src="[PLACEHOLDER_166x130]" class="mobile-full"\n' +
    '                              alt="" style="vertical-align:top; width: 100%; height: auto; -ko-attr-width: @imageWidth; max-width: 166px; -ko-max-width: @[imageWidth]px; -ko-attr-alt: @image.alt" />\n' +
    '                          </a>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                    </table>\n' +
    '\n' +
    '</div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\n' +
    '</div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\n' +
    '\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        </div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <!-- /sideArticleBlock -->\n' +
    '\n' +
    '  <!-- singleArticleBlock -->\n' +
    '  <table class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf"\n' +
    '    style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor" data-ko-block="singleArticleBlock">\n' +
    '    <tr>\n' +
    '      <td class="vb-outer" align="center" valign="top" bgcolor="#bfbfbf"\n' +
    '        style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]-->\n' +
    '        <div class="oldwebkit">\n' +
    '        <table width="570" border="0" cellpadding="0" cellspacing="18" class="vb-container fullpad" bgcolor="#ffffff"\n' +
    '          style="width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;">\n' +
    '          <tr data-ko-display="imageVisible">\n' +
    '            <td width="100%" valign="top" align="left" class="links-color">\n' +
    '              <a data-ko-link="image.url" href="">\n' +
    '                <img data-ko-editable="image.src" border="0" hspace="0" vspace="0" width="534" data-ko-placeholder-height="200"\n' +
    '                  src="[PLACEHOLDER_534x200]" class="mobile-full"\n' +
    '                  alt="" style="vertical-align:top; max-width:534px; width: 100%; height: auto;\n' +
    '                  -ko-attr-alt: @image.alt" />\n' +
    '              </a>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '          <tr><td><table align="left" border="0" cellpadding="0" cellspacing="0" width="100%">\n' +
    '            <tr data-ko-display="titleVisible">\n' +
    '              <td style="font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\n' +
    '                -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color">\n' +
    '                <span style="color: #3f3f3f; -ko-color: @titleTextStyle.color" data-ko-editable="text">\n' +
    '               Section Title\n' +
    '                </span>\n' +
    '              </td>\n' +
    '            </tr>\n' +
    '            <tr data-ko-display="titleVisible">\n' +
    '              <td height="9" style="font-size:1px; line-height: 1px;">&nbsp;</td>\n' +
    '            </tr>\n' +
    '            <tr>\n' +
    '              <td align="left" style="text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\n' +
    '                -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color"\n' +
    '                data-ko-editable="longText" class="long-text links-color">\n' +
    '                <p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>\n' +
    '              </td>\n' +
    '            </tr>\n' +
    '            <tr data-ko-display="buttonVisible">\n' +
    '              <td height="13" style="font-size:1px; line-height: 1px;">&nbsp;</td>\n' +
    '            </tr>\n' +
    '            <tr data-ko-display="buttonVisible">\n' +
    '              <td valign="top">\n' +
    '                <table cellpadding="0" border="0" align="left" cellspacing="0" class="mobile-full">\n' +
    '                  <tr>\n' +
    '                    <td width="auto" valign="middle" bgcolor="#bfbfbf" align="center" height="26"\n' +
    '                      style="font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\n' +
    '                      padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\n' +
    '                      -ko-border-radius: @[buttonStyle.radius]px;\n' +
    '                      -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\n' +
    '                      -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color; ">\n' +
    '                      <a data-ko-editable="buttonLink.text" href="" style="text-decoration: none; color: #3f3f3f; font-weight: normal;\n' +
    '                        -ko-color: @buttonStyle.color; -ko-attr-href: @buttonLink.url">BUTTON</a>\n' +
    '                    </td>\n' +
    '                  </tr>\n' +
    '                </table>\n' +
    '              </td>\n' +
    '            </tr>\n' +
    '          </table></td></tr>\n' +
    '        </table>\n' +
    '        </div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <!-- /singleArticleBlock -->\n' +
    '\n' +
    '  <!-- TitleBlock -->\n' +
    '  <table class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf"\n' +
    '    style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor" data-ko-block="titleBlock">\n' +
    '    <tr>\n' +
    '      <td class="vb-outer" align="center" valign="top" bgcolor="#bfbfbf"\n' +
    '        style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]-->\n' +
    '        <div class="oldwebkit">\n' +
    '        <table width="570" border="0" cellpadding="0" cellspacing="9" class="vb-container halfpad" bgcolor="#ffffff"\n' +
    '          style="width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;">\n' +
    '          <tr>\n' +
    '            <td bgcolor="#ffffff" align="center"\n' +
    '              style="background-color: #ffffff; font-size: 22px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align: center;\n' +
    '              -ko-attr-align: @bigTitleStyle.align; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\n' +
    '              -ko-font-size: @[bigTitleStyle.size]px; -ko-font-family: @bigTitleStyle.face; -ko-color: @bigTitleStyle.color; -ko-text-align: @bigTitleStyle.align">\n' +
    '              <span data-ko-editable="text">Section Title</span>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        </div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <!-- /TitleBlock -->\n' +
    '\n' +
    '  <!-- textBlock -->\n' +
    '  <table class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf"\n' +
    '    style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor" data-ko-block="textBlock">\n' +
    '    <tr>\n' +
    '      <td class="vb-outer" align="center" valign="top" bgcolor="#bfbfbf"\n' +
    '        style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]-->\n' +
    '        <div class="oldwebkit">\n' +
    '        <table width="570" border="0" cellpadding="0" cellspacing="18" class="vb-container fullpad" bgcolor="#ffffff"\n' +
    '          style="width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;">\n' +
    '          <tr>\n' +
    '            <td align="left" style="text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\n' +
    '              -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color"\n' +
    '              data-ko-editable="longText" class="long-text links-color">\n' +
    '              <p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts.</p>\n' +
    '              <p>Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        </div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <!-- /textBlock -->\n' +
    '\n' +
    '  <!-- tripleArticleBlock -->\n' +
    '  <table class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf"\n' +
    '    style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor" data-ko-block="tripleArticleBlock">\n' +
    '    <tr>\n' +
    '      <td class="vb-outer" align="center" valign="top" bgcolor="#bfbfbf"\n' +
    '        style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]-->\n' +
    '        <div class="oldwebkit">\n' +
    '        <table width="570" border="0" cellpadding="0" cellspacing="9" class="vb-row fullpad" bgcolor="#ffffff"\n' +
    '          style="width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;">\n' +
    '          <tr>\n' +
    '            <td align="center" valign="top" class="mobile-row" style="font-size: 0">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="552"><tr><![endif]-->\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="184"><![endif]-->\n' +
    '<div style="display:inline-block; max-width:184px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '\n' +
    '                    <table class="vb-content" border="0" cellspacing="9" cellpadding="0" width="184" style="width: 100%" align="left">\n' +
    '                      <tr data-ko-display="imageVisible">\n' +
    '                        <td width="100%" valign="top" align="left" class="links-color" style="padding-bottom: 9px">\n' +
    '                          <a data-ko-link="leftImage.url" href="">\n' +
    '                            <img data-ko-editable="leftImage.src" border="0" hspace="0" vspace="0" width="166" height="90"\n' +
    '                              src="[PLACEHOLDER_166x90]" class="mobile-full"\n' +
    '                             alt="" style="vertical-align:top; width: 100%; height: auto; -ko-attr-height: @imageHeight;\n' +
    '                               -ko-attr-alt: @leftImage.alt" />\n' +
    '                          </a>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr data-ko-display="titleVisible">\n' +
    '                        <td style="font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\n' +
    '                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color">\n' +
    '                          <span style="color: #3f3f3f; -ko-color: @titleTextStyle.color" data-ko-editable="leftTitleText">Title\n' +
    '                          </span>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr>\n' +
    '                        <td align="left" style="text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\n' +
    '                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color"\n' +
    '                          data-ko-editable="leftLongText" class="long-text links-color">\n' +
    '                          <p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts. </p>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr data-ko-display="buttonVisible">\n' +
    '                        <td valign="top">\n' +
    '                          <table cellpadding="0" border="0" align="left" cellspacing="0" class="mobile-full" style="padding-top: 4px">\n' +
    '                            <tr>\n' +
    '                              <td width="auto" valign="middle" bgcolor="#bfbfbf" align="center" height="26"\n' +
    '                                style="font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\n' +
    '                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\n' +
    '                                -ko-border-radius: @[buttonStyle.radius]px;\n' +
    '                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\n' +
    '                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color; ">\n' +
    '                                <a data-ko-editable="leftButtonLink.text" href="" style="text-decoration: none; color: #3f3f3f; font-weight: normal;\n' +
    '                                  -ko-color: @buttonStyle.color; -ko-attr-href: @leftButtonLink.url">BUTTON</a>\n' +
    '                              </td>\n' +
    '                            </tr>\n' +
    '                          </table>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                    </table>\n' +
    '\n' +
    '</div><!--[if (gte mso 9)|(lte ie 8)]></td>\n' +
    '<td align="left" valign="top" width="184">\n' +
    '<![endif]--><div style="display:inline-block; max-width:184px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '\n' +
    '                    <table class="vb-content" border="0" cellspacing="9" cellpadding="0" width="184" style="width: 100%" align="left">\n' +
    '                      <tr data-ko-display="imageVisible">\n' +
    '                        <td width="100%" valign="top" align="left" class="links-color" style="padding-bottom: 9px">\n' +
    '                          <a data-ko-link="middleImage.url">\n' +
    '                            <img data-ko-editable="middleImage.src" border="0" hspace="0" vspace="0" width="166" height="90"\n' +
    '                              src="[PLACEHOLDER_166x90]" class="mobile-full"\n' +
    '                              alt="" style="vertical-align:top; width: 100%; height: auto; -ko-attr-height: @imageHeight;\n' +
    '                              -ko-attr-alt: @middleImage.alt" />\n' +
    '                          </a>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr data-ko-display="titleVisible">\n' +
    '                        <td style="font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\n' +
    '                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color">\n' +
    '                          <span style="color: #3f3f3f; -ko-color: @titleTextStyle.color"  data-ko-editable="middleTitleText">\n' +
    '                         Title\n' +
    '                          </span>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr>\n' +
    '                        <td align="left" style="text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\n' +
    '                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color"\n' +
    '                          data-ko-editable="middleLongText" class="long-text links-color">\n' +
    '                          <p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts. </p>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr data-ko-display="buttonVisible">\n' +
    '                        <td valign="top">\n' +
    '                          <table cellpadding="0" border="0" align="left" cellspacing="0" class="mobile-full" style="padding-top: 4px">\n' +
    '                            <tr>\n' +
    '                              <td width="auto" valign="middle" bgcolor="#bfbfbf" align="center" height="26"\n' +
    '                                style="font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\n' +
    '                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\n' +
    '                                -ko-border-radius: @[buttonStyle.radius]px;\n' +
    '                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\n' +
    '                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color; ">\n' +
    '                                <a data-ko-editable="middleButtonLink.text" href="" style="text-decoration: none; color: #3f3f3f; font-weight: normal;\n' +
    '                                  -ko-color: @buttonStyle.color; -ko-attr-href: @middleButtonLink.url">BUTTON</a>\n' +
    '                              </td>\n' +
    '                            </tr>\n' +
    '                          </table>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                    </table>\n' +
    '\n' +
    '</div><!--[if (gte mso 9)|(lte ie 8)]></td>\n' +
    '<td align="left" valign="top" width="184">\n' +
    '<![endif]--><div style="display:inline-block; max-width:184px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '\n' +
    '                    <table class="vb-content" border="0" cellspacing="9" cellpadding="0" width="184" style="width: 100%" align="right">\n' +
    '                      <tr data-ko-display="imageVisible">\n' +
    '                        <td width="100%" valign="top" align="left" class="links-color" style="padding-bottom: 9px">\n' +
    '                          <a data-ko-link="rightImage.url">\n' +
    '                            <img data-ko-editable="rightImage.src" border="0" hspace="0" vspace="0" width="166" height="90"\n' +
    '                              src="[PLACEHOLDER_166x90]" class="mobile-full"\n' +
    '                              alt="" style="vertical-align:top; width: 100%; height: auto; -ko-attr-height: @imageHeight;\n' +
    '                              -ko-attr-alt: @rightImage.alt" />\n' +
    '                          </a>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr data-ko-display="titleVisible">\n' +
    '                        <td style="font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\n' +
    '                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color">\n' +
    '                          <span style="color: #3f3f3f; -ko-color: @titleTextStyle.color" data-ko-editable="rightTitleText">\n' +
    '                         Title\n' +
    '                          </span>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr>\n' +
    '                        <td align="left" style="text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\n' +
    '                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color"\n' +
    '                          data-ko-editable="rightLongText" class="long-text links-color">\n' +
    '                          <p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts. </p>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr data-ko-display="buttonVisible">\n' +
    '                        <td valign="top">\n' +
    '                          <table cellpadding="0" border="0" align="left" cellspacing="0" class="mobile-full" style="padding-top: 4px">\n' +
    '                            <tr>\n' +
    '                              <td width="auto" valign="middle" bgcolor="#bfbfbf" align="center" height="26"\n' +
    '                                style="font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\n' +
    '                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\n' +
    '                                -ko-border-radius: @[buttonStyle.radius]px;\n' +
    '                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\n' +
    '                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color;">\n' +
    '                                <a data-ko-editable="rightButtonLink.text" href="" style="text-decoration: none; color: #3f3f3f; font-weight: normal;\n' +
    '                                  -ko-color: @buttonStyle.color; -ko-attr-href: @rightButtonLink.url">BUTTON</a>\n' +
    '                              </td>\n' +
    '                            </tr>\n' +
    '                          </table>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                    </table>\n' +
    '\n' +
    '</div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\n' +
    '\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        </div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <!-- /tripleArticleBlock -->\n' +
    '\n' +
    '  <!-- doubleArticleBlock -->\n' +
    '  <table class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf"\n' +
    '    style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor" data-ko-block="doubleArticleBlock">\n' +
    '    <tr>\n' +
    '      <td class="vb-outer" align="center" valign="top" bgcolor="#bfbfbf"\n' +
    '        style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]-->\n' +
    '        <div class="oldwebkit">\n' +
    '        <table width="570" border="0" cellpadding="0" cellspacing="9" class="vb-row fullpad" bgcolor="#ffffff"\n' +
    '          style="width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;">\n' +
    '          <tr>\n' +
    '            <td align="center" valign="top" style="font-size: 0">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="552"><tr><![endif]-->\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="276"><![endif]-->\n' +
    '<div style="display:inline-block; max-width:276px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '\n' +
    '                    <table class="vb-content" border="0" cellspacing="9" cellpadding="0" width="276" style="width: 100%" align="left">\n' +
    '                      <tr data-ko-display="imageVisible">\n' +
    '                        <td width="100%" align="left" class="links-color" style="padding-bottom: 9px">\n' +
    '                          <a data-ko-link="leftImage.url">\n' +
    '                            <img data-ko-editable="leftImage.src" border="0" hspace="0" vspace="0" width="258" height="100"\n' +
    '                              src="[PLACEHOLDER_258x100]" class="mobile-full"\n' +
    '                              alt="" style="vertical-align:top; width: 100%; height: auto; -ko-attr-height: @imageHeight;\n' +
    '                              -ko-attr-alt: @leftImage.alt" />\n' +
    '                          </a>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr data-ko-display="titleVisible">\n' +
    '                        <td style="font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\n' +
    '                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color">\n' +
    '                          <span style="color: #3f3f3f; -ko-color: @titleTextStyle.color" data-ko-editable="leftTitleText">\n' +
    '                          Title\n' +
    '                          </span>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr>\n' +
    '                        <td align="left" style="text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\n' +
    '                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color"\n' +
    '                          data-ko-editable="leftLongText" class="long-text links-color">\n' +
    '                          <p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts. </p>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr data-ko-display="buttonVisible">\n' +
    '                        <td valign="top">\n' +
    '                          <table cellpadding="0" border="0" align="left" cellspacing="0" class="mobile-full" style="padding-top: 4px;">\n' +
    '                            <tr>\n' +
    '                              <td width="auto" valign="middle" bgcolor="#bfbfbf" align="center" height="26"\n' +
    '                                style="font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\n' +
    '                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\n' +
    '                                -ko-border-radius: @[buttonStyle.radius]px;\n' +
    '                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\n' +
    '                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color; ">\n' +
    '                                <a data-ko-editable="leftButtonLink.text" href="" style="text-decoration: none; color: #3f3f3f; font-weight: normal;\n' +
    '                                  -ko-color: @buttonStyle.color; -ko-attr-href: @leftButtonLink.url">BUTTON</a>\n' +
    '                              </td>\n' +
    '                            </tr>\n' +
    '                          </table>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                    </table>\n' +
    '\n' +
    '</div><!--[if (gte mso 9)|(lte ie 8)]></td>\n' +
    '<td align="left" valign="top" width="276">\n' +
    '<![endif]--><div style="display:inline-block; max-width:276px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '\n' +
    '                    <table class="vb-content" border="0" cellspacing="9" cellpadding="0" width="276" style="width: 100%" align="right">\n' +
    '                      <tr data-ko-display="imageVisible">\n' +
    '                        <td width="100%" valign="top" align="left" class="links-color" style="padding-bottom: 9px">\n' +
    '                          <a data-ko-link="rightImage.url">\n' +
    '                            <img data-ko-editable="rightImage.src" border="0" hspace="0" vspace="0" width="258" height="100"\n' +
    '                              src="[PLACEHOLDER_258x100]" class="mobile-full"\n' +
    '                              alt="" style="vertical-align:top; width: 100%; height: auto; -ko-attr-height: @imageHeight;\n' +
    '                              -ko-attr-alt: @rightImage.alt" />\n' +
    '                          </a>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr data-ko-display="titleVisible">\n' +
    '                        <td style="font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\n' +
    '                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color">\n' +
    '                          <span style="color: #3f3f3f; -ko-color: @titleTextStyle.color" data-ko-editable="rightTitleText">\n' +
    '                         Title\n' +
    '                          </span>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr>\n' +
    '                        <td align="left" style="text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\n' +
    '                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color"\n' +
    '                          data-ko-editable="rightLongText" class="long-text links-color">\n' +
    '                          <p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts.</p>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                      <tr data-ko-display="buttonVisible">\n' +
    '                        <td valign="top">\n' +
    '                          <table cellpadding="0" border="0" align="left" cellspacing="0" class="mobile-full" style="padding-top: 4px;">\n' +
    '                            <tr>\n' +
    '                              <td width="auto" valign="middle" bgcolor="#bfbfbf" align="center" height="26"\n' +
    '                                style="font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\n' +
    '                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\n' +
    '                                -ko-border-radius: @[buttonStyle.radius]px;\n' +
    '                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\n' +
    '                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color; ">\n' +
    '                                <a data-ko-editable="rightButtonLink.text" href="" style="text-decoration: none; color: #3f3f3f; font-weight: normal;\n' +
    '                                  -ko-color: @buttonStyle.color; -ko-attr-href: @rightButtonLink.url">BUTTON</a>\n' +
    '                              </td>\n' +
    '                            </tr>\n' +
    '                          </table>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                    </table>\n' +
    '\n' +
    '</div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\n' +
    '\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        </div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <!-- /doubleArticleBlock -->\n' +
    '\n' +
    '  <!-- hrBlock -->\n' +
    '  <table class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf"\n' +
    '    style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor" data-ko-block="hrBlock">\n' +
    '    <tr>\n' +
    '      <td class="vb-outer" align="center" valign="top" bgcolor="#bfbfbf"\n' +
    '        style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]-->\n' +
    '        <div class="oldwebkit">\n' +
    '        <table width="570" border="0" cellpadding="0" cellspacing="9" class="vb-container halfpad" bgcolor="#ffffff"\n' +
    '          style="width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;">\n' +
    '          <tr>\n' +
    '            <td valign="top" bgcolor="#ffffff" style="background-color: #ffffff;\n' +
    '              -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor" align="center">\n' +
    '              <table width="100%" cellspacing="0" cellpadding="0" border="0"\n' +
    '                style="width:100%; -ko-width: @[hrStyle.hrWidth]%; -ko-attr-width: @[hrStyle.hrWidth]%">\n' +
    '                <tr>\n' +
    '                  <td width="100%" height="1" style="font-size:1px; line-height: 1px; width: 100%; background-color: #3f3f3f;\n' +
    '                  -ko-background-color: @hrStyle.color; -ko-attr-height: @hrStyle.hrHeight; -ko-line-height: @[hrStyle.hrHeight]px">&nbsp;</td>\n' +
    '                </tr>\n' +
    '              </table>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        </div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <!-- /hrBlock -->\n' +
    '\n' +
    '  <!-- buttonBlock -->\n' +
    '  <table class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf"\n' +
    '    style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor"  data-ko-block="buttonBlock">\n' +
    '    <tr>\n' +
    '      <td class="vb-outer" align="center" valign="top" bgcolor="#bfbfbf"\n' +
    '        style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]-->\n' +
    '        <div class="oldwebkit">\n' +
    '        <table width="570" border="0" cellpadding="0" cellspacing="18" class="vb-container fullpad" bgcolor="#ffffff"\n' +
    '          style="width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;">\n' +
    '          <tr>\n' +
    '            <td valign="top" bgcolor="#ffffff" style="background-color: #ffffff;\n' +
    '              -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor" align="center">\n' +
    '\n' +
    '              <table cellpadding="0" border="0" align="center" cellspacing="0" class="mobile-full">\n' +
    '                <tr>\n' +
    '                  <td width="auto" valign="middle" bgcolor="#bfbfbf" align="center" height="50"\n' +
    '                    style="font-size:22px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; font-weight: normal;\n' +
    '                    padding-left: 14px; padding-right: 14px; background-color: #bfbfbf; border-radius: 4px;\n' +
    '                    -ko-attr-bgcolor: @bigButtonStyle.buttonColor; -ko-background-color: @bigButtonStyle.buttonColor;\n' +
    '                     -ko-border-radius: @[bigButtonStyle.radius]px;\n' +
    '                    -ko-font-size: @[bigButtonStyle.size]px; -ko-font-family: @bigButtonStyle.face; -ko-color: @bigButtonStyle.color; ">\n' +
    '                    <a data-ko-link="link.url" data-ko-editable="link.text" href="" style="text-decoration: none; color: #3f3f3f; font-weight: normal;\n' +
    '                      -ko-color: @bigButtonStyle.color;">BUTTON</a>\n' +
    '                  </td>\n' +
    '                </tr>\n' +
    '              </table>\n' +
    '\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        </div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <!-- /buttonBlock -->\n' +
    '\n' +
    '  <!-- imageBlock  -->\n' +
    '  <table class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf;\n' +
    '    -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor" data-ko-block="imageBlock">\n' +
    '    <tr>\n' +
    '      <td class="vb-outer" valign="top" align="center">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]-->\n' +
    '        <div class="oldwebkit">\n' +
    '        <table data-ko-display="gutterVisible eq false" width="570" class="vb-container fullwidth" cellpadding="0" border="0" bgcolor="#ffffff" align="center"\n' +
    '          cellspacing="0" style="width: 100%; max-width: 570px; background-color: #ffffff; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor;">\n' +
    '          <tr>\n' +
    '            <td valign="top" align="center">\n' +
    '              <a data-ko-link="image.url" href="" style="text-decoration: none;"><img data-ko-editable="image.src"\n' +
    '                  hspace="0" border="0" vspace="0" width="570" data-ko-placeholder-height="200"\n' +
    '                  src="[PLACEHOLDER_570x200]" class="mobile-full"\n' +
    '                  alt="" style="max-width: 570px; display: block; border-radius: 0px; width: 100%; height: auto; font-size: 13px;\n' +
    '                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px;\n' +
    '                  -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color; -ko-attr-alt: @image.alt;" /></a>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        <table data-ko-display="gutterVisible" width="570" class="vb-container fullpad" cellpadding="0" border="0" bgcolor="#ffffff" align="center"\n' +
    '          cellspacing="18" style="width: 100%; max-width: 570px; background-color: #ffffff; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor; display: none;">\n' +
    '          <tr>\n' +
    '            <td valign="top" align="center">\n' +
    '              <a data-ko-link="image.url" href="" style="text-decoration: none;"><img data-ko-editable="image.src"\n' +
    '                  hspace="0" border="0" vspace="0" width="534" data-ko-placeholder-height="280"\n' +
    '                  src="[PLACEHOLDER_534x280]" class="mobile-full"\n' +
    '                  alt="" style="max-width: 534px; display: block; border-radius: 0px; width: 100%; height: auto; font-size: 13px;\n' +
    '                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px;\n' +
    '                  -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color; -ko-attr-alt: @image.alt;" /></a>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        </div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <!-- imageBlock -->\n' +
    '\n' +
    '  <!-- doubleImageBlock -->\n' +
    '  <table class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf;\n' +
    '    -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor" data-ko-block="doubleImageBlock">\n' +
    '    <tr>\n' +
    '      <td class="vb-outer" align="center" valign="top" bgcolor="#bfbfbf"\n' +
    '        style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor">\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]-->\n' +
    '        <div class="oldwebkit">\n' +
    '        <table data-ko-display="gutterVisible eq false" width="570" class="vb-container fullwidth" cellpadding="0" border="0" bgcolor="#ffffff" align="center"\n' +
    '          cellspacing="0" style="width: 100%; max-width: 570px; background-color: #ffffff; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor;">\n' +
    '          <tr>\n' +
    '            <td valign="top" align="center" class="mobile-row" style="font-size: 0">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><![endif]-->\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="285"><![endif]-->\n' +
    '<div style="display:inline-block; max-width:285px; vertical-align:top; width:100%; width:100%; " class="mobile-full">\n' +
    '              <a data-ko-link="leftImage.url" href="" style="text-decoration: none;"><img data-ko-editable="leftImage.src"\n' +
    '                  hspace="0" align="left" border="0" vspace="0" width="285" height="180" class="mobile-full"\n' +
    '                  src="[PLACEHOLDER_285x180]"\n' +
    '                  alt="" style="display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\n' +
    '                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\n' +
    '                  -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @leftImage.alt;" /></a>\n' +
    '</div><!--[if (gte mso 9)|(lte ie 8)]></td>\n' +
    '<td align="left" valign="top" width="285">\n' +
    '<![endif]--><div style="display:inline-block; max-width:285px; vertical-align:top; width:100%; width:100%; " class="mobile-full">\n' +
    '              <a data-ko-link="rightImage.url" href="" style="text-decoration: none;"><img data-ko-editable="rightImage.src"\n' +
    '                  hspace="0" align="right" border="0" vspace="0" width="285" height="180" class="mobile-full"\n' +
    '                  src="[PLACEHOLDER_285x180]"\n' +
    '                  alt="" style="display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\n' +
    '                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\n' +
    '                  -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @rightImage.alt;" /></a>\n' +
    '</div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        <table data-ko-display="gutterVisible" width="570" class="vb-row fullpad" border="0" cellpadding="0" cellspacing="9" bgcolor="#ffffff"\n' +
    '            style="width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor; display: none;">\n' +
    '          <tr>\n' +
    '            <td align="center" valign="top" bgcolor="#ffffff" style="background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor; font-size: 0">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="552"><tr><![endif]-->\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="276"><![endif]-->\n' +
    '<div style="display:inline-block; max-width:276px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '\n' +
    '              <table class="vb-content" width="276" style="width: 100%" border="0" cellpadding="0" cellspacing="9" align="left">\n' +
    '                <tr>\n' +
    '                  <td valign="top">\n' +
    '                    <a data-ko-link="leftImage.url" href="" style="text-decoration: none;">\n' +
    '                      <img data-ko-editable="leftImage.src"\n' +
    '                        hspace="0" align="left" border="0" vspace="0" width="258" height="180"\n' +
    '                        src="[PLACEHOLDER_258x180]" class="mobile-full"\n' +
    '                        alt="" style="display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\n' +
    '                        font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\n' +
    '                        -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @leftImage.alt;" /></a>\n' +
    '                  </td>\n' +
    '                </tr>\n' +
    '              </table>\n' +
    '\n' +
    '</div><!--[if (gte mso 9)|(lte ie 8)]></td>\n' +
    '<td align="left" valign="top" width="276">\n' +
    '<![endif]--><div style="display:inline-block; max-width:276px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '\n' +
    '              <table class="vb-content" width="276" style="width: 100%" border="0" cellpadding="0" cellspacing="9" align="right">\n' +
    '                <tr>\n' +
    '                  <td valign="top">\n' +
    '                    <a data-ko-link="rightImage.url" href="" style="text-decoration: none;"><img data-ko-editable="rightImage.src"\n' +
    '                        hspace="0" align="right" border="0" vspace="0" width="258" height="180"\n' +
    '                        src="[PLACEHOLDER_258x180]" class="mobile-full"\n' +
    '                        alt="" style="display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\n' +
    '                        font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\n' +
    '                        -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @rightImage.alt;" /></a>\n' +
    '                  </td>\n' +
    '                </tr>\n' +
    '              </table>\n' +
    '\n' +
    '</div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\n' +
    '\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        </div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <!-- /doubleImageBlock -->\n' +
    '\n' +
    '  <!--  tripleImageBlock -->\n' +
    '  <table class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf;\n' +
    '    -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor" data-ko-block="tripleImageBlock">\n' +
    '    <tr>\n' +
    '      <td class="vb-outer" valign="top" align="center" style="">\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]-->\n' +
    '        <div class="oldwebkit">\n' +
    '        <table data-ko-display="gutterVisible eq false" width="570" class="vb-container fullwidth" cellpadding="0" border="0" bgcolor="#ffffff" align="center"\n' +
    '          cellspacing="0" style="width: 100%; max-width: 570px; background-color: #ffffff; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor;">\n' +
    '          <tr>\n' +
    '            <td valign="top" align="center" class="mobile-row" style="font-size: 0">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><![endif]-->\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="190"><![endif]-->\n' +
    '<div style="display:inline-block; max-width:190px; vertical-align:top; width:100%; " class="mobile-full">\n' +
    '              <a data-ko-link="leftImage.url" href="" style="text-decoration: none;"><img data-ko-editable="leftImage.src"\n' +
    '                  hspace="0" align="left" border="0" vspace="0" width="190" height="160" class="mobile-full"\n' +
    '                  src="[PLACEHOLDER_190x160]"\n' +
    '                  alt="" style="display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\n' +
    '                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\n' +
    '                  -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @leftImage.alt;" /></a>\n' +
    '</div><!--[if (gte mso 9)|(lte ie 8)]></td>\n' +
    '<td align="left" valign="top" width="190">\n' +
    '<![endif]--><div style="display:inline-block; max-width:190px; vertical-align:top; width:100%; " class="mobile-full">\n' +
    '              <a data-ko-link="middleImage.url" href="" style="text-decoration: none;"><img data-ko-editable="middleImage.src"\n' +
    '                  hspace="0" align="left" border="0" vspace="0" width="190" height="160" class="mobile-full"\n' +
    '                  src="[PLACEHOLDER_190x160]"\n' +
    '                  alt="" style="display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\n' +
    '                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\n' +
    '                  -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @middleImage.alt;" /></a>\n' +
    '</div><!--[if (gte mso 9)|(lte ie 8)]></td>\n' +
    '<td align="left" valign="top" width="190">\n' +
    '<![endif]--><div style="display:inline-block; max-width:190px; vertical-align:top; width:100%; " class="mobile-full">\n' +
    '              <a data-ko-link="rightImage.url" href="" style="text-decoration: none;"><img data-ko-editable="rightImage.src"\n' +
    '                  hspace="0" align="right" border="0" vspace="0" width="190" height="160" class="mobile-full"\n' +
    '                  src="[PLACEHOLDER_190x160]"\n' +
    '                  alt="" style="display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\n' +
    '                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\n' +
    '                  -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @rightImage.alt;" /></a>\n' +
    '</div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        <table data-ko-display="gutterVisible" width="570" border="0" cellpadding="0" cellspacing="9" bgcolor="#ffffff" class="vb-row fullpad"\n' +
    '          style="width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor; display: none;">\n' +
    '          <tr>\n' +
    '            <td align="center" valign="top" bgcolor="#ffffff" style="font-size: 0; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="552"><tr><![endif]-->\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="184"><![endif]-->\n' +
    '<div style="display:inline-block; max-width:184px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '\n' +
    '              <table class="vb-content" width="184" style="width: 100%" border="0" cellpadding="0" cellspacing="9" align="left">\n' +
    '                <tr>\n' +
    '                  <td valign="top">\n' +
    '                    <a data-ko-link="leftImage.url" href="" style="text-decoration: none;"><img data-ko-editable="leftImage.src"\n' +
    '                      hspace="0" align="left" border="0" vspace="0" width="166" height="160"\n' +
    '                      src="[PLACEHOLDER_166x160]" class="mobile-full"\n' +
    '                      alt="" style="display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\n' +
    '                      font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\n' +
    '                      -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @leftImage.alt;" /></a>\n' +
    '                  </td>\n' +
    '                </tr>\n' +
    '              </table>\n' +
    '\n' +
    '</div><!--[if (gte mso 9)|(lte ie 8)]></td>\n' +
    '<td align="left" valign="top" width="184">\n' +
    '<![endif]--><div style="display:inline-block; max-width:184px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '\n' +
    '              <table class="vb-content" width="184" style="width: 100%" border="0" cellpadding="0" cellspacing="9" align="left">\n' +
    '                <tr>\n' +
    '                  <td valign="top">\n' +
    '                    <a data-ko-link="middleImage.url" href="" style="text-decoration: none"><img data-ko-editable="middleImage.src"\n' +
    '                      hspace="0" align="left" border="0" vspace="0" width="166" height="160"\n' +
    '                      src="[PLACEHOLDER_166x160]" class="mobile-full"\n' +
    '                      alt="" style="display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\n' +
    '                      font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\n' +
    '                      -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @middleImage.alt;" /></a>\n' +
    '                  </td>\n' +
    '                </tr>\n' +
    '              </table>\n' +
    '\n' +
    '</div><!--[if (gte mso 9)|(lte ie 8)]></td>\n' +
    '<td align="left" valign="top" width="184">\n' +
    '<![endif]--><div style="display:inline-block; max-width:184px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '\n' +
    '              <table class="vb-content" width="184" style="width: 100%" border="0" cellpadding="0" cellspacing="9" align="right">\n' +
    '                <tr>\n' +
    '                  <td valign="top">\n' +
    '                    <a data-ko-link="rightImage.url" href="" style="text-decoration: none"><img data-ko-editable="rightImage.src"\n' +
    '                      hspace="0" align="right" border="0" vspace="0" width="166" height="160"\n' +
    '                      src="[PLACEHOLDER_166x160]" class="mobile-full"\n' +
    '                      alt="" style="display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\n' +
    '                      font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\n' +
    '                      -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @rightImage.alt;" /></a>\n' +
    '                  </td>\n' +
    '                </tr>\n' +
    '              </table>\n' +
    '\n' +
    '</div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\n' +
    '\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        </div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <!-- /tripleImageBlock -->\n' +
    '\n' +
    '  <!-- spacerBlock -->\n' +
    '  <table class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf"\n' +
    '    style="background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor" data-ko-block="spacerBlock">\n' +
    '    <tr>\n' +
    '      <td class="vb-outer" valign="top" align="center" bgcolor="#bfbfbf" height="24"\n' +
    '        style="-ko-attr-height: @spacerSize; height: 24px; -ko-height: @[spacerSize]px; background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor;\n' +
    '        -ko-attr-bgcolor: @externalBackgroundColor; font-size:1px; line-height: 1px;">&nbsp;</td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <!-- /spacerBlock -->\n' +
    '\n' +
    '  <!-- socialBlock -->\n' +
    '  <table width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#3f3f3f"\n' +
    '    style="background-color: #3f3f3f; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor"  data-ko-block="socialBlock">\n' +
    '    <tr>\n' +
    '      <td align="center" valign="top" bgcolor="#3f3f3f" style="background-color: #3f3f3f;\n' +
    '        -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;">\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]-->\n' +
    '        <div class="oldwebkit">\n' +
    '        <table width="570" style="width: 100%; max-width: 570px" border="0" cellpadding="0" cellspacing="9" class="vb-row fullpad" align="center">\n' +
    '          <tr>\n' +
    '            <td valign="top"  align="center" style="font-size: 0;">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="552"><tr><![endif]-->\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="276"><![endif]-->\n' +
    '<div style="display:inline-block; max-width:276px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '\n' +
    '                    <table class="vb-content" border="0" cellspacing="9" cellpadding="0" width="276" style="width: 100%" align="left">\n' +
    '                      <tr>\n' +
    '                        <td valign="middle" align="left"\n' +
    '                          style="font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #919191; text-align:left;\n' +
    '                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color"\n' +
    '                          data-ko-editable="longText" class="long-text links-color mobile-textcenter">\n' +
    '                          <p>Address and <a href="">Contacts</a></p>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                    </table>\n' +
    '\n' +
    '</div><!--[if (gte mso 9)|(lte ie 8)]></td>\n' +
    '<td align="left" valign="top" width="276">\n' +
    '<![endif]--><div style="display:inline-block; max-width:276px; vertical-align:top; width:100%;" class="mobile-full">\n' +
    '\n' +
    '                    <table class="vb-content" border="0" cellspacing="9" cellpadding="0" width="276" style="width: 100%" align="right">\n' +
    '                      <tr>\n' +
    '                        <td align="right" valign="middle" class="links-color socialLinks mobile-textcenter" data-ko-display="socialIconType eq \'colors\'">\n' +
    '                          <span data-ko-display="fbVisible" data-ko-wrap="false">&nbsp;</span>\n' +
    '                          <a data-ko-display="fbVisible" href="" style="-ko-attr-href: @fbUrl">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/facebook_ok.png" alt="Facebook" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="twVisible" data-ko-wrap="false">&nbsp;</span>\n' +
    '                          <a data-ko-display="twVisible" href="" style="-ko-attr-href: @twUrl">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/twitter_ok.png" alt="Twitter" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="ggVisible" data-ko-wrap="false">&nbsp;</span>\n' +
    '                          <a data-ko-display="ggVisible" href="" style="-ko-attr-href: @ggUrl">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/google+_ok.png" alt="Google+" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="webVisible" data-ko-wrap="false" style="display: none">&nbsp;</span>\n' +
    '                          <a data-ko-display="webVisible" href="" style="-ko-attr-href: @webUrl; display: none">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/web_ok.png" alt="Web" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="inVisible" data-ko-wrap="false" style="display: none">&nbsp;</span>\n' +
    '                          <a data-ko-display="inVisible" href="" style="-ko-attr-href: @inUrl; display: none">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/linkedin_ok.png" alt="Linkedin" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="flVisible" data-ko-wrap="false" style="display: none">&nbsp;</span>\n' +
    '                          <a data-ko-display="flVisible" href="" style="-ko-attr-href: @flUrl; display: none">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/flickr_ok.png" alt="Flickr" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="viVisible" data-ko-wrap="false" style="display: none">&nbsp;</span>\n' +
    '                          <a data-ko-display="viVisible" href="" style="-ko-attr-href: @viUrl; display: none">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/vimeo_ok.png" alt="Vimeo" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="instVisible" data-ko-wrap="false" style="display: none">&nbsp;</span>\n' +
    '                          <a data-ko-display="instVisible" href="" style="-ko-attr-href: @instUrl; display: none">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/instagram_ok.png" alt="Instagram" border="0"  class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="youVisible" data-ko-wrap="false" style="display: none">&nbsp;</span>\n' +
    '                          <a data-ko-display="youVisible" href="" style="-ko-attr-href: @youUrl; display: none">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/youtube_ok.png" alt="Youtube" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                        </td>\n' +
    '                        <td align="right" valign="middle" class="links-color socialLinks mobile-textcenter" data-ko-display="socialIconType eq \'bw\'"\n' +
    '                          style="display: none">\n' +
    '                          <span data-ko-display="fbVisible" data-ko-wrap="false">&nbsp;</span>\n' +
    '                          <a data-ko-display="fbVisible" href="" style="-ko-attr-href: @fbUrl">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/facebook_bw_ok.png" alt="Facebook" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="twVisible" data-ko-wrap="false">&nbsp;</span>\n' +
    '                          <a data-ko-display="twVisible" href="" style="-ko-attr-href: @twUrl">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/twitter_bw_ok.png" alt="Twitter" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="ggVisible" data-ko-wrap="false">&nbsp;</span>\n' +
    '                          <a data-ko-display="ggVisible" href="" style="-ko-attr-href: @ggUrl">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/google+_bw_ok.png" alt="Google+" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="webVisible" data-ko-wrap="false" style="display: none">&nbsp;</span>\n' +
    '                          <a data-ko-display="webVisible" href="" style="-ko-attr-href: @webUrl; display: none">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/web_bw_ok.png" alt="Web" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="inVisible" data-ko-wrap="false" style="display: none">&nbsp;</span>\n' +
    '                          <a data-ko-display="inVisible" href="" style="-ko-attr-href: @inUrl; display: none">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/linkedin_bw_ok.png" alt="Linkedin" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="flVisible" data-ko-wrap="false" style="display: none">&nbsp;</span>\n' +
    '                          <a data-ko-display="flVisible" href="" style="-ko-attr-href: @flUrl; display: none">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/flickr_bw_ok.png" alt="Flickr" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="viVisible" data-ko-wrap="false" style="display: none">&nbsp;</span>\n' +
    '                          <a data-ko-display="viVisible" href="" style="-ko-attr-href: @viUrl; display: none">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/vimeo_bw_ok.png" alt="Vimeo" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="instVisible" data-ko-wrap="false" style="display: none">&nbsp;</span>\n' +
    '                          <a data-ko-display="instVisible" href="" style="-ko-attr-href: @instUrl; display: none">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/instagram_bw_ok.png" alt="Instagram" border="0"  class="socialIcon" />\n' +
    '                          </a>\n' +
    '                          <span data-ko-display="youVisible" data-ko-wrap="false" style="display: none">&nbsp;</span>\n' +
    '                          <a data-ko-display="youVisible" href="" style="-ko-attr-href: @youUrl; display: none">\n' +
    '                            <img src="[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/youtube_bw_ok.png" alt="Youtube" border="0" class="socialIcon" />\n' +
    '                          </a>\n' +
    '                        </td>\n' +
    '                      </tr>\n' +
    '                    </table>\n' +
    '\n' +
    '</div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\n' +
    '\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        </div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <!-- /socialBlock -->\n' +
    '\n' +
    '  </div>\n' +
    '\n' +
    '  <!-- footerBlock -->\n' +
    '  <table width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#3f3f3f"\n' +
    '    style="background-color: #3f3f3f; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor"  data-ko-block="footerBlock">\n' +
    '    <tr>\n' +
    '      <td align="center" valign="top" bgcolor="#3f3f3f" style="background-color: #3f3f3f;\n' +
    '        -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor">\n' +
    '\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]-->\n' +
    '        <div class="oldwebkit">\n' +
    '        <table width="570" style="width: 100%; max-width: 570px" border="0" cellpadding="0" cellspacing="9" class="vb-container halfpad" align="center">\n' +
    '          <tr>\n' +
    '            <td data-ko-editable="longText" class="long-text links-color"\n' +
    '                style="text-align:center; font-size: 13px;color: #919191; font-weight: normal; text-align:center; font-family: Arial, Helvetica, sans-serif;\n' +
    '                -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face"><p>Email sent to <a href="mailto:[EMAIL]">[EMAIL]</a></p></td>\n' +
    '          </tr>\n' +
    '          <tr>\n' +
    '            <td style="text-align: center;">\n' +
    '              <a style="text-decoration: underline; color: #ffffff; text-align: center; font-size: 13px;\n' +
    '                font-weight: normal; font-family: Arial, Helvetica, sans-serif;\n' +
    '                -ko-text-decoration: @linkStyle.decoration; -ko-color: @[Color.readability(linkStyle.color, backgroundColor) gt 2 ? linkStyle.color : (Color.isReadable(\'#ffffff\', backgroundColor) ? \'#ffffff\' : \'#000000\')]; -ko-font-size: @[linkStyle.size]px; -ko-font-family: @linkStyle.face"\n' +
    '                href="[LINK_UNSUBSCRIBE]"><span data-ko-editable="disiscrivitiText">Unsubscribe</span></a>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '\n' +
    '          <tr data-ko-display="_root_.sponsor.visible" style="display: none;text-align:center">\n' +
    '            <td align="center">\n' +
    '                <a href="http://www.void.it" target="_blank" rel="noreferrer"><img border="0" hspace="0" vspace="0" src="[URL_BASE]/static/mosaico/templates/versafix-1/img/sponsor.gif" alt="sponsor"\n' +
    '                  style="Margin:auto;display:inline !important;" /></a>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '        </div>\n' +
    '<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <!-- /footerBlock -->\n' +
    '\n' +
    '  </center>\n' +
    '</body>\n' +
    '</html>\n';

function getVersafix() {
    return versafix;
}

module.exports = {
    getVersafix
};