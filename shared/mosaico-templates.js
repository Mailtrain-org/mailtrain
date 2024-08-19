'use strict';

const {renderTag} = require('./templates');

function getVersafix(tagLanguage) {
    const tg = tag => renderTag(tagLanguage, tag);

    const versafix = '<!DOCTYPE html>\n' +
        '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">\n' +
        '<head>\n' +
        '  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n' +
        '  <meta name="viewport" content="initial-scale=1.0">\n' +
        '  <meta name="format-detection" content="telephone=no">\n' +
        '  <title style="-ko-bind-text: @titleText">TITLE</title>\n' +
        '  <style type="text/css">\n' +
        '    @supports -ko-blockdefs {\n' +
        '      id { widget: id }\n' +
        '      size { label: Size; widget: integer; min: 8; max: 60; }\n' +
        '      visible { label: Visible?; widget: boolean }\n' +
        '      color { label: Color; widget: color }\n' +
        '      radius {\n' +
        '        label: Corner Radius;\n' +
        '        widget: integer;\n' +
        '        max: 40;\n' +
        '        help: Attention - this property is not supported on all email clients (i.e. Outlook)\n' +
        '      }\n' +
        '      face { label: Font; widget: select; options: Arial, Helvetica, sans-serif=Arial|Arial Black, Arial Black, Gadget, sans-serif=Arial Black|Comic Sans MS, Comic Sans MS5, cursive=Comic Sans|Courier New, Courier New, monospace=Courier|Georgia, serif=Georgia|Impact, sans-serif=Impact|Lucida Console, Monaco, monospace=Lucida Console|Lucida Sans Unicode, Lucida Grande, sans-serif=Lucida Sans Unicode|Times New Roman, Times, serif=Times New Roman|Verdana, Geneva, sans-serif=Verdana;\n' +
        '        renderHint: fontface\n' +
        '      }\n' +
        '      decoration { label: Decoration; widget: select; options: none=None|underline=Underline }\n' +
        '      linksColor { label: Link Color; extend: color }\n' +
        '      linksDecoration { label: Underlined Links?; extend: decoration }\n' +
        '      buttonColor { label: Button Color; extend: color; transparent: true }\n' +
        '      text { label: Paragraph; widget: text }\n' +
        '      url { label: Link; widget: url }\n' +
        '      src { label: Image; widget: src }\n' +
        '      hrWidth { label: Width; widget: integer; min: 5; max: 100; step: 5; }\n' +
        '      hrHeight { label: Line height; widget: integer; max: 80; }\n' +
        '\n' +
        '      height { label: Height; widget: integer }\n' +
        '      imageHeight { label: Image Height; extend: height; min: 10; max: 1000 }\n' +
        '      lineHeight { label: Line Height; widget: select; options: normal=Normal|150%=1.5 Lines|200%=Double;\n' +
        '        buttonsetLabels: normal=1x|150%=1.5x|200%=2x;\n' +
        '      }\n' +
        '\n' +
        '      spacerSize { label: Height; widget: integer; max: 90; min: 4; }\n' +
        '      align { label: Alignment; widget: select; options:left=Left|center=Center|right=Right;\n' +
        '        buttonsetIconClasses: left=fa fa-fw fa-align-left|center=fa fa-fw fa-align-center|right=fa fa-fw fa-align-right\n' +
        '      }\n' +
        '      alt {\n' +
        '        label: Alternative Text;\n' +
        '        widget: text;\n' +
        '        help: Alternative text will be shown on email clients that does not download image automatically;\n' +
        '      }\n' +
        '      sponsor { label: Sponsor; properties: visible=true src url alt; category: hidden }\n' +
        '      titleText { label: Title Text; category: hidden }\n' +
        '      gutterVisible { label: Show Gutter; extend: visible }\n' +
        '      socialIconType { label: Icon Version; widget: select;\n' +
        '        options: colors=Coloured Circle\n' +
        '                |bw=Gray Circle\n' +
        '                |bwb=Black Circle\n' +
        '                |sqbw=Gray Square\n' +
        '                |sqcolors=Coloured Square\n' +
        '                |sqbwb=Black Square\n' +
        '                |rdcol=Rounded Colors\n' +
        '                |rdbl=Rounded Black\n' +
        '                |rdw=Rounded White\n' +
        '                |sqrdcol=Squared Colors\n' +
        '                |sqrdbl=Squared Black\n' +
        '                |sqrdw=Squared White\n' +
        '                |white=White\n' +
        '                |coloured=Coloured\n' +
        '                |black=Black;\n' +
        '        renderHint: images; \n' +
        '        imagesSources: colors=url(\'edres/_social-select-colors.png\')\n' +
        '                      |bw=url(\'edres/_social-select-bw.png\')\n' +
        '                      |bwb=url(\'edres/_social-select-bwb.png\')\n' +
        '                      |sqbw=url(\'edres/_social-select-sqbw.png\')\n' +
        '                      |sqcolors=url(\'edres/_social-select-sqcolors.png\')\n' +
        '                      |sqbwb=url(\'edres/_social-select-sqbwb.png\')\n' +
        '                      |rdcol=url(\'edres/_social-select-rdcol.png\')\n' +
        '                      |rdbl=url(\'edres/_social-select-rdbl.png\')\n' +
        '                      |rdw=url(\'edres/_social-select-rdw.png\')\n' +
        '                      |sqrdcol=url(\'edres/_social-select-sqrdcol.png\')\n' +
        '                      |sqrdbl=url(\'edres/_social-select-sqrdbl.png\')\n' +
        '                      |sqrdw=url(\'edres/_social-select-sqrdw.png\')\n' +
        '                      |white=url(\'edres/_social-select-white.png\')\n' +
        '                      |coloured=url(\'edres/_social-select-coloured.png\')\n' +
        '                      |black=url(\'edres/_social-select-black.png\');\n' +
        '      }\n' +
        '      bigSocialIconType { label: Icon Version; widget: select; \n' +
        '        options: bw=Gray Circle\n' +
        '                |colors=Coloured Circle\n' +
        '                |bwb=Black Circle\n' +
        '                |sqbw=Gray Square\n' +
        '                |sqcolors=Coloured Square\n' +
        '                |sqbwb=Black Square\n' +
        '                |rdcol=Rounded Colors\n' +
        '                |rdbl=Rounded Black\n' +
        '                |rdw=Rounded White\n' +
        '                |sqrdcol=Squared Colors\n' +
        '                |sqrdbl=Squared Black\n' +
        '                |sqrdw=Squared White\n' +
        '                |white=White\n' +
        '                |coloured=Coloured\n' +
        '                |black=Black;\n' +
        '        renderHint: images; \n' +
        '        imagesSources: bw=url(\'edres/_social-select-bw.png\')\n' +
        '                      |colors=url(\'edres/_social-select-colors.png\')\n' +
        '                      |bwb=url(\'edres/_social-select-bwb.png\')\n' +
        '                      |sqbw=url(\'edres/_social-select-sqbw.png\')\n' +
        '                      |sqcolors=url(\'edres/_social-select-sqcolors.png\')\n' +
        '                      |sqbwb=url(\'edres/_social-select-sqbwb.png\')\n' +
        '                      |rdcol=url(\'edres/_social-select-rdcol.png\')\n' +
        '                      |rdbl=url(\'edres/_social-select-rdbl.png\')\n' +
        '                      |rdw=url(\'edres/_social-select-rdw.png\')\n' +
        '                      |sqrdcol=url(\'edres/_social-select-sqrdcol.png\')\n' +
        '                      |sqrdbl=url(\'edres/_social-select-sqrdbl.png\')\n' +
        '                      |sqrdw=url(\'edres/_social-select-sqrdw.png\')\n' +
        '                      |white=url(\'edres/_social-select-white.png\')\n' +
        '                      |coloured=url(\'edres/_social-select-coloured.png\')\n' +
        '                      |black=url(\'edres/_social-select-black.png\');\n' +
        '      }\n' +
        '      bigSocialIconSize { label: Icon Size; widget: select; options: 32=Small|48=Big; renderHint: buttonset }\n' +
        '\n' +
        '      preheaderLinkOption {\n' +
        '        label: Unsubscribe Link;\n' +
        '        widget: select;\n' +
        '        options: ' + tg('LINK_PREFERENCES') + '=Profile|' + tg('LINK_UNSUBSCRIBE') + '=Unsubscribe|none=None;\n' +
        '        help: If -None- is selected, preHeader text will be shown;\n' +
        '      }\n' +
        '     \n' +
        '      hrStyle { label: Separator Style; properties: color hrWidth hrHeight; }\n' +
        '      hrStyle:preview { height: 200%; width: 200%; bottom: 20px; -ko-border-bottom: @[hrHeight]px solid @color; }\n' +
        '      preheaderVisible { label: Show Preheader; extend: visible; help: Preheader block is the first one on the top of the page. It contains web version link and optionally unsubscribe link or a preheader text that will be shown as a preview on some email clients }\n' +
        '\n' +
        '      /* content types */\n' +
        '      blocks { label: Blocks; properties: blocks[]; }\n' +
        '      link { label: Link; properties: text url }\n' +
        '      image { label: Image; properties: src url alt }\n' +
        '      backgroundColor { label: Background Color; extend: color }\n' +
        '      buttonLink { label: Button; extend: link }\n' +
        '      \n' +
        '      /* texts and links */\n' +
        '      textStyle { label: Text; properties: face color size align }\n' +
        '      textStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\n' +
        '      linkStyle { label: Link; properties: face color size decoration=none }\n' +
        '      linkStyle:preview { -ko-bind-text: @[\'Link\']; -ko-font-size: @[size]px; -ko-font-family: @face; -ko-color: @color; -ko-text-decoration: @[decoration] }\n' +
        '      longTextStyle { label: Paragraph; properties: face color size lineHeight align linksColor   }\n' +
        '      longTextStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\n' +
        '      bigButtonStyle { label: Big Button; extend: buttonStyle }\n' +
        '      titleTextStyle { label: Title; extend: textStyle }\n' +
        '      /* background */\n' +
        '      externalBackgroundColor { label: External Background; extend: color }\n' +
        '\n' +
        '      externalTextStyle { label: Alternative Text; extend: textStyle }\n' +
        '      externalTextStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\n' +
        '     \n' +
        '      bigTitleStyle { label: Title; properties: face color size align}\n' +
        '      bigTitleStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\n' +
        '      /* buttons */\n' +
        '      buttonStyle color { label: Text Color; extend: color; transparent: true; }\n' +
        '      buttonStyle size { label: Text Size; extend: size }\n' +
        '      buttonStyle borderWidth { label: Border Width; widget: integer; min: 0; max: 10; }\n' +
        '      buttonStyle borderColor { label: Border Color; }\n' +
        '      buttonStyle verticalPadding { label: Vertical Padding; widget: integer; min: 0; max: 40; }\n' +
        '      buttonStyle horizontalPadding { label: Horizontal Padding; widget: integer; min: 0; max: 40; }\n' +
        '      buttonStyle { label: Button; properties: face color size align buttonColor radius borderWidth borderColor verticalPadding horizontalPadding }\n' +
        '      buttonStyle:preview { -ko-bind-text: @[\'Button\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; -ko-background-color: @buttonColor; padding-left: 5px; -ko-border-radius: @[radius]px; }\n' +
        '\n' +
        '      blockSpacing verticalSpacing { label: Vertical Spacing; widget: integer; min: 0; max: 40 }\n' +
        '      blockSpacing horizontalSpacing { label: Horizontal Spacing; widget: integer; min: 0; max: 40 }\n' +
        '      blockSpacing topPadding { label: Top Padding; widget: integer; min: 0; max: 40 }\n' +
        '      blockSpacing bottomPadding { label: Bottom Padding; widget: integer; min: 0; max: 40 }\n' +
        '      blockSpacing { label: Block Spacing; properties: topPadding bottomPadding verticalSpacing horizontalSpacing; category: style /* make sure this ends up as a style property, with inheritance/theming */ }\n' +
        '      \n' +
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
        '      unsubscribeText{ label: Unsubscribe Text; extend: text;}\n' +
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
        '      template { label: Page; theme: frameTheme; properties: preheaderVisible=true; version: 1.3.5; }\n' +
        '\n' +
        '      footerBlock { label: Unsubscribe Block; theme: frameTheme }\n' +
        '      \n' +
        '      fbVisible { label: Facebook; extend: visible }\n' +
        '      twVisible { label: Twitter; extend: visible }\n' +
        '      ggVisible { label: Google+; extend: visible }\n' +
        '      inVisible { label: LinkedIn; extend: visible }\n' +
        '      piVisible { label: Pinterest; extend: visible }\n' +
        '      flVisible { label: Flickr; extend: visible }\n' +
        '      viVisible { label: Vimeo; extend: visible }\n' +
        '      webVisible { label: Website; extend: visible }\n' +
        '      waVisible { label: Whatsapp; extend: visible }\n' +
        '      tgVisible { label: Telegram; extend: visible }\n' +
        '      instVisible { label: Instagram; extend: visible }\n' +
        '      youVisible { label: YouTube; extend: visible }\n' +
        '      ttVisible { label: TikTok; extend: visible }\n' +
        '      tcVisible { label: Twitch; extend: visible }\n' +
        '      fbUrl { label: Facebook Link; extend: url }\n' +
        '      twUrl { label: Twitter Link; extend: url}\n' +
        '      ggUrl { label: Google+ Link; extend: url}\n' +
        '      inUrl { label: LinkedIn Link; extend: url}\n' +
        '      piUrl { label: Pinterest Link; extend: url}\n' +
        '      flUrl { label: Flickr Link; extend: url}\n' +
        '      viUrl { label: Vimeo Link; extend: url}\n' +
        '      webUrl { label: Website Link; extend: url}\n' +
        '      waUrl { label: Whatsapp Link; extend: url}\n' +
        '      tgUrl { label: Telegram Link; extend: url}\n' +
        '      instUrl { label: Instagram Link; extend: url}\n' +
        '      youUrl { label: YouTube Link; extend: url}\n' +
        '      ttUrl { label: TikTok Link; extend: url}\n' +
        '      tcUrl { label: Twitch Link; extend: url}\n' +
        '\n' +
        '      socialBlock {\n' +
        '        label: Social Block;\n' +
        '        properties: socialIconType=colors fbVisible=true fbUrl twVisible=true twUrl ggVisible=false ggUrl webVisible=false webUrl waVisible=false waUrl tgVisible=false tgUrl inVisible=false inUrl piVisible=false piUrl flVisible=false flUrl viVisible=false viUrl instVisible=true instUrl youVisible=false youUrl ttVisible=false ttUrl tcVisible=false tcUrl longTextStyle longText backgroundColor;\n' +
        '        variant:socialIconType;\n' +
        '        theme: frameTheme\n' +
        '      }\n' +
        '\n' +
        '      bigSocialBlock {\n' +
        '        label: Big Social Block;\n' +
        '        properties: bigSocialIconType=rdcol bigSocialIconSize=48 fbVisible=true fbUrl twVisible=true twUrl ggVisible=false ggUrl webVisible=false webUrl waVisible=false waUrl tgVisible=false tgUrl inVisible=true inUrl piVisible=false piUrl flVisible=false flUrl viVisible=false viUrl instVisible=true instUrl youVisible=true youUrl ttVisible=false ttUrl longTextStyle tcVisible=false tcUrl longTextStyle longText;\n' +
        '        variant: bigSocialIconType;\n' +
        '        theme: contentTheme\n' +
        '      }\n' +
        '\n' +
        '      shareButtonStyle iconColorType { label: Icon Color; widget: select; options: brand=Brand|white=White|black=Black; }\n' +
        '      shareButtonStyle color { label: Text Color; extend: color; transparent: true; }\n' +
        '      shareButtonStyle size { label: Text Size; widget: integer; min: 10; max: 25; }\n' +
        '      shareButtonStyle { label: Share Button; properties: face iconColorType=black color size align buttonColor radius }\n' +
        '      shareButtonStyle:preview { -ko-bind-text: @[\'Button\']; -ko-font-family: @face; -ko-color: @[\'black\']; -ko-font-size: @[size]px; -ko-background-color: @[\'#CCCCCC\']; padding-left: 5px; -ko-border-radius: @[radius]px; }\n' +
        '\n' +
        '      shareButtonType { label: Button Version;widget: select; options:reverse=Brand buttons|simple=Brand icons|custom=Custom buttons; }\n' +
        '      shareBlock fbVisible { label: Facebook; }\n' +
        '      shareBlock twVisible { label: Twitter }\n' +
        '      shareBlock inVisible { label: LinkedIn }\n' +
        '      shareBlock ggVisible { label: Google+ }\n' +
        '      shareBlock piVisible { label: Pinterest }\n' +
        '      shareBlock customUrl { label: Share Link; }\n' +
        '      shareBlock {\n' +
        '        label: Share Block;\n' +
        '        properties: shareButtonType=reverse fbVisible=true twVisible=true inVisible=false ggVisible=false piVisible=false customUrl shareButtonStyle;\n' +
        '        variant: shareButtonType;\n' +
        '        theme: contentTheme;\n' +
        '      }\n' +
        '      \n' +
        '      preheaderBlock { label:Preheader Block; theme: frameTheme; visibility: _root_.preheaderVisible; /* this is a fixed block:  using "visibility" property link this to the boolean variable that deal with its visibility and let mosaico add a trash button to hide it "inline" */ }\n' +
        '\n' +
        '      sideArticleBlock imagePos {label:Image position;widget:select; options: left=Left|right=Right;\n' +
        '        buttonsetIconClasses: left=fa fa-fw fa-address-card-o|right=fa fa-fw fa-address-card-o fa-flip-horizontal\n' +
        '      }\n' +
        '      sideArticleBlock imageWidth { label: Image Size; widget: select; options: 120=Small|166=Medium|258=Big;\n' +
        '        renderHint: buttonset;\n' +
        '      }\n' +
        '      sideArticleBlock { label: Image+Text Block; properties: backgroundColor titleVisible=true buttonVisible=true imageWidth=166 imagePos=left titleTextStyle longTextStyle buttonStyle  image  longText buttonLink; variant:imagePos; theme: contentTheme }\n' +
        '\n' +
        '      sideImageBlock imagePos {label:Image position;widget:select; options: left=Left|right=Right;\n' +
        '        buttonsetIconClasses: left=fa fa-fw fa-address-card-o|right=fa fa-fw fa-address-card-o fa-flip-horizontal\n' +
        '      }\n' +
        '      sideImageBlock imageWidth { label: Image Size; widget: select; options: 143=Mini|190=Small|285=Medium|380=Big|427=Large; }\n' +
        '      sideImageBlock { label: Image+Text Block; properties: backgroundColor titleVisible=true buttonVisible=true imageWidth=285 imagePos=left titleTextStyle longTextStyle buttonStyle  image  longText buttonLink; variant:imagePos; theme: contentTheme }\n' +
        '\n' +
        '      textBlock { label: Text Block; properties: backgroundColor longTextStyle longText; theme: contentTheme}\n' +
        '\n' +
        '      singleArticleBlock imageWidth { label: Image Size; widget: select; options: 166=Small|258=Medium|350=Big|534=Full }\n' +
        '      singleArticleBlock { label: Image/Text Block; properties: titleVisible=true buttonVisible=true imageVisible=true imageWidth=534 titleTextStyle longTextStyle buttonStyle  image  longText buttonLink; theme: contentTheme}\n' +
        '\n' +
        '      fixedImageHeightVisible { label: Fix image height; extend: visible; }\n' +
        '      externalBackgroundVisible { label: Transparent background; extend: visible; }\n' +
        '\n' +
        '      doubleArticleBlock { label: 2 Columns Block; properties: backgroundColor titleVisible=true buttonVisible=true imageVisible=true fixedImageHeightVisible=true titleTextStyle longTextStyle buttonStyle  leftImage  leftLongText leftButtonLink rightImage  rightLongText rightButtonLink; theme: contentTheme}\n' +
        '\n' +
        '      tripleArticleBlock { label: 3 Columns Block; properties: backgroundColor titleVisible=true buttonVisible=true imageVisible=true fixedImageHeightVisible=true titleTextStyle longTextStyle buttonStyle  leftImage  leftLongText leftButtonLink middleImage  middleLongText middleButtonLink rightImage  rightLongText rightButtonLink; theme: contentTheme}\n' +
        '      \n' +
        '      logoBlock longTextStyle { label: Alternative Text; }\n' +
        '      logoBlock imageWidth { label: Image Size; widget: select; options: 166=Small|258=Medium|350=Big;\n' +
        '        renderHint: buttonset;\n' +
        '      }\n' +
        '      logoBlock { label: Logo Block; properties: externalBackgroundVisible=true image imageWidth=258 externalTextStyle; variant: externalBackgroundVisible; theme: contentTheme}\n' +
        '      \n' +
        '      /* a deprecated block is a block that is "known", so loaded models will still work, but is not available in the block list */\n' +
        '      titleBlock { label: Title; properties: bigTitleStyle; theme: contentTheme; deprecated: true }\n' +
        '      titleBlock2 { label: Title; properties: bigTitleStyle; theme: contentTheme}\n' +
        '\n' +
        '      imageBlock longTextStyle { label: Alternative Text; }\n' +
        '      imageBlock { label: Image; properties: gutterVisible=false; variant: gutterVisible; theme: contentTheme }\n' +
        '\n' +
        '      doubleImageBlock longTextStyle { label: Alternative Text; }\n' +
        '      doubleImageBlock { label: Two Image Gallery; properties: gutterVisible=false fixedImageHeightVisible=true; variant: gutterVisible; theme: contentTheme }\n' +
        '\n' +
        '      tripleImageBlock longTextStyle { label: Alternative Text; }\n' +
        '      tripleImageBlock { label: Three Image Gallery;properties:gutterVisible=false fixedImageHeightVisible=true; variant: gutterVisible; theme: contentTheme}\n' +
        '\n' +
        '      buttonBlock { label: Button Block; properties: bigButtonStyle; theme: contentTheme}\n' +
        '      hrBlock { label: Separator Block; properties: hrStyle; theme: contentTheme; deprecated: true }\n' +
        '      hrBlock2 { label: Separator Block; properties: hrStyle; theme: contentTheme }\n' +
        '      spacerBlock { label: Spacer Block; properties: externalBackgroundVisible=true; variant: externalBackgroundVisible; theme: contentTheme }\n' +
        '\n' +
        '      spacerBlock:preview,\n' +
        '      logoBlock:preview { -ko-background-color: @[externalBackgroundColor] }\n' +
        '\n' +
        '      preheaderBlock:preview,\n' +
        '      hrBlock:preview,\n' +
        '      hrBlock2:preview,\n' +
        '      sideArticleBlock:preview,\n' +
        '      sideImageBlock:preview,\n' +
        '      textBlock:preview,\n' +
        '      singleArticleBlock:preview,\n' +
        '      doubleArticleBlock:preview,\n' +
        '      tripleArticleBlock:preview,\n' +
        '      titleBlock:preview,\n' +
        '      titleBlock2:preview,\n' +
        '      footerBlock:preview,\n' +
        '      socialBlock:preview,\n' +
        '      buttonBlock:preview,\n' +
        '      titleBlock:preview { -ko-background-color: @[backgroundColor] }\n' +
        '    }\n' +
        '  </style>\n' +
        '  <style type="text/css" data-ko-remove="">\n' +
        '    /* PREVIEW STYLES */\n' +
        '    .fullpreview [data-ko-block=\'hrBlock\'],\n' +
        '    .fullpreview [data-ko-block=\'titleBlock\'] {\n' +
        '      display: none;\n' +
        '    }\n' +
        '  </style>\n' +
        '  <style type="text/css" data-inline="true">\n' +
        '    body { margin: 0; padding: 0; }\n' +
        '    img { border: 0px; display: block; }\n' +
        '\n' +
        '    .socialLinks { font-size: 6px; }\n' +
        '    .socialLinks a {\n' +
        '      display: inline-block;\n' +
        '    }\n' +
        '\n' +
        '    .long-text p { margin: 1em 0px; }\n' +
        '    .long-text p:last-child { margin-bottom: 0px; }\n' +
        '    .long-text p:first-child { margin-top: 0px; }\n' +
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
        '    /* outlook/office365 add buttons outside not-linked images and safari have 2px margin */\n' +
        '    [o365] button { margin: 0 !important; }\n' +
        '\n' +
        '    /* outlook */\n' +
        '    table { mso-table-rspace: 0pt; mso-table-lspace: 0pt; }\n' +
        '    #outlook a { padding: 0; }\n' +
        '    img { outline: none; text-decoration: none; border: none; -ms-interpolation-mode: bicubic; }\n' +
        '    a img { border: none; }\n' +
        '\n' +
        '    @media screen and (max-width: 600px) {\n' +
        '      table.vb-row {\n' +
        '        width: 95% !important;\n' +
        '      }\n' +
        '\n' +
        '      .mobile-hide { display: none !important; }\n' +
        '      .mobile-textcenter { text-align: center !important; }\n' +
        '\n' +
        '      .mobile-full { \n' +
        '        width: 100% !important;\n' +
        '        max-width: none !important;\n' +
        '      }\n' +
        '    }\n' +
        '    \n' +
        '    /* samsung email workaround */\n' +
        '    @media screen and (max-width: 384px) {\n' +
        '      .mail-message-content { width: 414px !important; }\n' +
        '    }\n' +
        '  </style>\n' +
        '  <style type="text/css" data-inline="true">\n' +
        '    [data-ko-block=tripleArticleBlock] .links-color a, \n' +
        '    [data-ko-block=tripleArticleBlock] .links-color a:link, \n' +
        '    [data-ko-block=tripleArticleBlock] .links-color a:visited,\n' +
        '    [data-ko-block=tripleArticleBlock] .links-color a:hover {\n' +
        '      color: #3f3f3f;\n' +
        '      -ko-color: @longTextStyle.linksColor;\n' +
        '      text-decoration: underline;\n' +
        '    }\n' +
        '\n' +
        '    [data-ko-block=doubleArticleBlock] .links-color a, \n' +
        '    [data-ko-block=doubleArticleBlock] .links-color a:link, \n' +
        '    [data-ko-block=doubleArticleBlock] .links-color a:visited,\n' +
        '    [data-ko-block=doubleArticleBlock] .links-color a:hover {\n' +
        '      color: #3f3f3f;\n' +
        '      -ko-color: @longTextStyle.linksColor;\n' +
        '      text-decoration: underline;\n' +
        '    }\n' +
        '\n' +
        '    [data-ko-block=singleArticleBlock] .links-color a, \n' +
        '    [data-ko-block=singleArticleBlock] .links-color a:link, \n' +
        '    [data-ko-block=singleArticleBlock] .links-color a:visited,\n' +
        '    [data-ko-block=singleArticleBlock] .links-color a:hover {\n' +
        '      color: #3f3f3f;\n' +
        '      -ko-color: @longTextStyle.linksColor;\n' +
        '      text-decoration: underline;\n' +
        '    }\n' +
        '\n' +
        '    [data-ko-block=textBlock] .links-color a, \n' +
        '    [data-ko-block=textBlock] .links-color a:link, \n' +
        '    [data-ko-block=textBlock] .links-color a:visited,\n' +
        '    [data-ko-block=textBlock] .links-color a:hover {\n' +
        '      color: #3f3f3f;\n' +
        '      -ko-color: @longTextStyle.linksColor;\n' +
        '      text-decoration: underline;\n' +
        '    }\n' +
        '\n' +
        '    [data-ko-block=sideArticleBlock] .links-color a, \n' +
        '    [data-ko-block=sideArticleBlock] .links-color a:link, \n' +
        '    [data-ko-block=sideArticleBlock] .links-color a:visited,\n' +
        '    [data-ko-block=sideArticleBlock] .links-color a:hover {\n' +
        '      color: #3f3f3f;\n' +
        '      -ko-color: @longTextStyle.linksColor;\n' +
        '      text-decoration: underline;\n' +
        '    }\n' +
        '\n' +
        '    [data-ko-block=sideImageBlock] .links-color a, \n' +
        '    [data-ko-block=sideImageBlock] .links-color a:link, \n' +
        '    [data-ko-block=sideImageBlock] .links-color a:visited,\n' +
        '    [data-ko-block=sideImageBlock] .links-color a:hover {\n' +
        '      color: #3f3f3f;\n' +
        '      -ko-color: @longTextStyle.linksColor;\n' +
        '      text-decoration: underline;\n' +
        '    }\n' +
        '\n' +
        '    [data-ko-block=socialBlock] .links-color a, \n' +
        '    [data-ko-block=socialBlock] .links-color a:link, \n' +
        '    [data-ko-block=socialBlock] .links-color a:visited,\n' +
        '    [data-ko-block=socialBlock] .links-color a:hover {\n' +
        '      color: #cccccc;\n' +
        '      -ko-color: @longTextStyle.linksColor;\n' +
        '      text-decoration: underline;\n' +
        '    }\n' +
        '\n' +
        '    [data-ko-block=footerBlock] .links-color a, \n' +
        '    [data-ko-block=footerBlock] .links-color a:link, \n' +
        '    [data-ko-block=footerBlock] .links-color a:visited,\n' +
        '    [data-ko-block=footerBlock] .links-color a:hover {\n' +
        '      color: #cccccc;\n' +
        '      -ko-color: @longTextStyle.linksColor;\n' +
        '      text-decoration: underline;\n' +
        '    }\n' +
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
        '  \n' +
        '</head>\n' +
        '<!--[if !(gte mso 15)]-->\n' +
        '<body bgcolor="#3f3f3f" text="#919191" alink="#cccccc" vlink="#cccccc" style="background-color: #3f3f3f; color: #919191;\n' +
        '  -ko-background-color: @_theme_.frameTheme.backgroundColor; -ko-attr-bgcolor: @_theme_.frameTheme.backgroundColor; -ko-color: @_theme_.frameTheme.longTextStyle.color;\n' +
        '  -ko-attr-text: @_theme_.frameTheme.longTextStyle.color; -ko-attr-alink: @_theme_.frameTheme.longTextStyle.linksColor;\n' +
        '  -ko-attr-vlink: @_theme_.frameTheme.longTextStyle.linksColor"><!--<![endif]--><center>\n' +
        '\n' +
        '  <div data-ko-display="preheaderVisible" data-ko-wrap="false">\n' +
        '\n' +
        '    \n' +
        '    <!-- preheaderBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#3f3f3f" style="background-color: #3f3f3f; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]" data-ko-block="preheaderBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <div data-ko-display="preheaderLinkOption neq \'none\'" style="display: none; font-size:1px; line-height: 1px; max-height:0px; max-width: 0px; opacity: 0; overflow: hidden; \n' +
        '          -ko-bind-text: @preheaderText"></div>\n' +
        '      <!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 570px; -mru-width: 0px" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 4px; padding-bottom: 4px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="width:100%; max-width: 552px; -mru-width: 0px"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="552"><tr><![endif]--><!--\n' +
        '        --><!--\n' +
        '          --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="276"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 276px; -mru-width: 0px; min-width: calc(276 * 100% / 552); -ko-min-width: @[\'calc(\' + (276) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="276" align="left">\n' +
        '          \n' +
        '            <tr data-ko-display="preheaderLinkOption neq \'none\'"><td width="100%" valign="top" style="font-weight: normal; color: #ffffff; font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align: left; -ko-font-size: @[linkStyle.size]px; -ko-color: @linkStyle.color; -ko-font-family: @linkStyle.face; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;" align="left"><a style="color: #ffffff; text-decoration: underline; -ko-attr-href: @[preheaderLinkOption]; -ko-color: @linkStyle.color; -ko-text-decoration: @linkStyle.decoration" href="' + tg('LINK_UNSUBSCRIBE') + '" data-ko-editable="unsubscribeText">Unsubscribe</a></td></tr>\n' +
        '            <tr data-ko-display="preheaderLinkOption eq \'none\'" style="display: none">\n' +
        '      <td width="100%" valign="top" style="font-weight: normal; color: #919191; font-size: 13px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-text-align: @longTextStyle.align; -ko-attr-align: @longTextStyle.align" align="left"><span style="font-weight: normal; -ko-bind-text: @preheaderText"></span></td>\n' +
        '    </tr>\n' +
        '          \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '          --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="276" class="mobile-hide"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 276px; -mru-width: 0px; min-width: calc(276 * 100% / 552); -ko-min-width: @[\'calc(\' + (276) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full mobile-hide"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="276" align="left">\n' +
        '          \n' +
        '            <tr><td width="100%" valign="top" style="font-weight: normal; color: #ffffff; font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align: right; -ko-font-size: @[linkStyle.size]px; -ko-color: @linkStyle.color; -ko-font-family: @linkStyle.face; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;" align="right"><a style="color: #ffffff; text-decoration: underline; -ko-color: @linkStyle.color; -ko-text-decoration: @linkStyle.decoration" href="' + tg('LINK_BROWSER') + '" data-ko-editable="webversionText">View in your browser</a></td></tr>\n' +
        '          \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '        --><!--\n' +
        '      --><!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]--></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /preheaderBlock -->\n' +
        '    \n' +
        '\n' +
        '  </div>\n' +
        '\n' +
        '  <div data-ko-container="main" data-ko-wrap="false">\n' +
        '\n' +
        '    \n' +
        '    <!-- logoBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="logoBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <div data-ko-wrap="false" style="width: 100%;" data-ko-display="externalBackgroundVisible"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; max-width: 570px; -mru-width: 0px" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="vertical-align:top; width:100%; max-width: 276px; -mru-width: 0px; -ko-max-width: @[2 * blockSpacing.horizontalSpacing + Math.round(imageWidth) + \'px\']"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -ko-attr-width: @[2 * blockSpacing.horizontalSpacing + Math.round(imageWidth)]" width="276">\n' +
        '          \n' +
        '          <tr><td width="100%" valign="top" align="center" class="links-color" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 258px; -mru-width: 0px; -ko-width: @[imageWidth]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="image.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #f3f3f3; font-size: 18px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[externalTextStyle.size]px; -ko-color: @externalTextStyle.color; -ko-font-family: @externalTextStyle.face; -ko-attr-alt: @image.alt; -ko-attr-alt-if: image.alt !== \'\'; width: 100%; max-width: 258px; -ko-attr-width: @[imageWidth]; -ko-max-width: @[imageWidth]px; height: auto" data-ko-editable="image.src" width="258" data-ko-placeholder-height="150" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=258%2C150"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '        \n' +
        '        </table></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]--></div>\n' +
        '      <div data-ko-wrap="false" style="width: 100%; display: none" data-ko-display="externalBackgroundVisible eq false"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="vertical-align:top; width:100%; max-width: 276px; -mru-width: 0px; -ko-max-width: @[2 * blockSpacing.horizontalSpacing + Math.round(imageWidth) + \'px\']"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -ko-attr-width: @[2 * blockSpacing.horizontalSpacing + Math.round(imageWidth)]" width="276">\n' +
        '          \n' +
        '          <tr><td width="100%" valign="top" align="center" class="links-color" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 258px; -mru-width: 0px; -ko-width: @[imageWidth]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="image.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @image.alt; -ko-attr-alt-if: image.alt !== \'\'; width: 100%; max-width: 258px; -ko-attr-width: @[imageWidth]; -ko-max-width: @[imageWidth]px; height: auto" data-ko-editable="image.src" width="258" data-ko-placeholder-height="150" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=258%2C150"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '        \n' +
        '        </table></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]--></div>\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /logoBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- sideArticleBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="sideArticleBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><table dir="" role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%"><tr><td align="center" valign="top" dir="ltr" style="direction: ltr; border-collapse: collapse; -ko-attr-dir: @[imagePos eq \'left\' ? \'ltr\' : \'rtl\']; -ko-direction: @[imagePos eq \'left\' ? \'ltr\' : \'rtl\']"><div style="width:100%; max-width: 552px; -mru-width: 0px"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="552"><tr><![endif]--><!--\n' +
        '        --><!--\n' +
        '          --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="184" style="-ko-attr-width: @[2 * blockSpacing.horizontalSpacing + Math.round(imageWidth)]"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 184px; -mru-width: 0px; -ko-max-width: @[2 * blockSpacing.horizontalSpacing + Math.round(imageWidth) + \'px\']; min-width: calc(184 * 100% / 552); -ko-min-width: @[\'calc(\' + (true ? 2 * blockSpacing.horizontalSpacing + Math.round(imageWidth) : 184) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -ko-attr-width: @[2 * blockSpacing.horizontalSpacing + Math.round(imageWidth)]; direction: ltr; -yandex-p: calc(2px - 3%)" width="184" dir="ltr" align="left">\n' +
        '          \n' +
        '            <tr><td width="100%" valign="top" align="center" class="links-color" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 166px; -mru-width: 0px; -ko-width: @[imageWidth]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="image.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @image.alt; -ko-attr-alt-if: image.alt !== \'\'; width: 100%; max-width: 166px; -ko-attr-width: @[imageWidth]; -ko-max-width: @[imageWidth]px; height: auto" data-ko-editable="image.src" width="166" data-ko-placeholder-height="130" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=166%2C130"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '          \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '          --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="368" style="-ko-attr-width: @[552 - 2 * blockSpacing.horizontalSpacing - Math.round(imageWidth)]"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 368px; -mru-width: 0px; -ko-max-width: @[552 - 2 * blockSpacing.horizontalSpacing - Math.round(imageWidth) + \'px\']; min-width: calc(368 * 100% / 552); -ko-min-width: @[\'calc(\' + (true ? 552 - 2 * blockSpacing.horizontalSpacing - Math.round(imageWidth) : 368) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -ko-attr-width: @[552 - 2 * blockSpacing.horizontalSpacing - Math.round(imageWidth)]; direction: ltr; -yandex-p: calc(2px - 3%)" width="368" dir="ltr" align="left">\n' +
        '          \n' +
        '            <tr data-ko-display="titleVisible">\n' +
        '      <td width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 18px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; -ko-font-size: @[titleTextStyle.size]px; -ko-color: @titleTextStyle.color; -ko-font-family: @titleTextStyle.face; -ko-text-align: @titleTextStyle.align; -ko-attr-align: @titleTextStyle.align" align="left"><span style="font-weight: normal" data-ko-editable="titleText">Title</span></td>\n' +
        '    </tr>\n' +
        '            <tr><td class="long-text links-color" width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; line-height: normal; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-text-align: @longTextStyle.align; -ko-attr-align: @longTextStyle.align; -ko-line-height: @[longTextStyle.lineHeight]" align="left" data-ko-editable="longText"><p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p></td></tr>\n' +
        '            <tr data-ko-display="buttonVisible">\n' +
        '      <td valign="top" align="left" style="-ko-attr-align: @buttonStyle.align; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><table role="presentation" cellpadding="6" border="0" align="left" cellspacing="0" style="border-spacing: 0; mso-padding-alt: 6px 18px 6px 18px; margin-top: 2px; -ko-attr-cellpadding: @[Math.min(buttonStyle.verticalPadding, buttonStyle.horizontalPadding)]; -ko-mso-padding-alt: @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px; -ko-attr-align: @buttonStyle.align"><tr data-ko-display="buttonVisible">\n' +
        '        <td width="auto" valign="middle" align="center" style="text-align:center; font-weight: normal; padding: 6px; padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; border-radius: 4px; border: 0px solid #3f3f3f; -ko-border-radius: @[buttonStyle.radius]px; -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor; -ko-border: @[buttonStyle.borderWidth]px solid @buttonStyle.borderColor; -ko-border-if: buttonStyle.borderWidth > 0; -ko-padding: @[buttonStyle.verticalPadding]px; -ko-padding-left: @[buttonStyle.horizontalPadding]px; -ko-padding-right: @[buttonStyle.horizontalPadding]px; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face" bgcolor="#bfbfbf"><a href="" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face; -ko-attr-href: @buttonLink.url"><span data-ko-wrap="false" data-ko-editable="buttonLink.text">BUTTON</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '          \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '        --><!--\n' +
        '      --><!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]--></div></td></tr></table></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /sideArticleBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- sideImageBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="sideImageBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0"><table dir="" role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%"><tr><td align="center" valign="top" dir="ltr" style="direction: ltr; border-collapse: collapse; -ko-attr-dir: @[imagePos eq \'left\' ? \'ltr\' : \'rtl\']; -ko-direction: @[imagePos eq \'left\' ? \'ltr\' : \'rtl\']"><div style="width:100%; max-width: 570px; -mru-width: 0px"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><![endif]--><!--\n' +
        '        --><!--\n' +
        '          --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="285" style="-ko-attr-width: @[imageWidth]"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 285px; -mru-width: 0px; -ko-max-width: @[imageWidth + \'px\']; min-width: calc(285 * 100% / 570); -ko-min-width: @[\'calc(\' + (true ? imageWidth : 285) * 100 / 570 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(570 * 570px - 570 * 100%); -ko-width: @[\'calc(\'+ 570 * 570 + \'px - \' + 570 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; width: 100%; -ko-attr-width: @[imageWidth]; direction: ltr; -yandex-p: calc(2px - 3%)" width="285" dir="ltr" align="left">\n' +
        '          \n' +
        '            <tr><td width="100%" valign="top" align="center" class="links-color"><!--[if (lte ie 8)]><div style="display: inline-block; width: 285px; -mru-width: 0px; -ko-width: @[imageWidth]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="image.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @image.alt; -ko-attr-alt-if: image.alt !== \'\'; width: 100%; max-width: 285px; -ko-attr-width: @[imageWidth]; -ko-max-width: @[imageWidth]px; height: auto" data-ko-editable="image.src" width="285" data-ko-placeholder-height="170" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=285%2C170"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '          \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '          --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="285" style="-ko-attr-width: @[570 - Math.round(imageWidth)]"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 285px; -mru-width: 0px; -ko-max-width: @[570 - Math.round(imageWidth) + \'px\']; min-width: calc(285 * 100% / 570); -ko-min-width: @[\'calc(\' + (true ? 570 - Math.round(imageWidth) : 285) * 100 / 570 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(570 * 570px - 570 * 100%); -ko-width: @[\'calc(\'+ 570 * 570 + \'px - \' + 570 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -ko-attr-width: @[570 - Math.round(imageWidth)]; direction: ltr; -yandex-p: calc(2px - 3%)" width="285" dir="ltr" align="left">\n' +
        '          \n' +
        '            <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="vertical-align:top; width:100%; max-width: 552px; -mru-width: 0px"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%" width="552">\n' +
        '          \n' +
        '              <tr data-ko-display="titleVisible">\n' +
        '      <td width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 18px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; -ko-font-size: @[titleTextStyle.size]px; -ko-color: @titleTextStyle.color; -ko-font-family: @titleTextStyle.face; -ko-text-align: @titleTextStyle.align; -ko-attr-align: @titleTextStyle.align" align="left"><span style="font-weight: normal" data-ko-editable="titleText">Title</span></td>\n' +
        '    </tr>\n' +
        '              <tr><td class="long-text links-color" width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; line-height: normal; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-text-align: @longTextStyle.align; -ko-attr-align: @longTextStyle.align; -ko-line-height: @[longTextStyle.lineHeight]" align="left" data-ko-editable="longText"><p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts.</p></td></tr>\n' +
        '              <tr data-ko-display="buttonVisible">\n' +
        '      <td valign="top" align="left" style="-ko-attr-align: @buttonStyle.align; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><table role="presentation" cellpadding="6" border="0" align="left" cellspacing="0" style="border-spacing: 0; mso-padding-alt: 6px 18px 6px 18px; margin-top: 2px; -ko-attr-cellpadding: @[Math.min(buttonStyle.verticalPadding, buttonStyle.horizontalPadding)]; -ko-mso-padding-alt: @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px; -ko-attr-align: @buttonStyle.align"><tr data-ko-display="buttonVisible">\n' +
        '        <td width="auto" valign="middle" align="center" style="text-align:center; font-weight: normal; padding: 6px; padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; border-radius: 4px; border: 0px solid #3f3f3f; -ko-border-radius: @[buttonStyle.radius]px; -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor; -ko-border: @[buttonStyle.borderWidth]px solid @buttonStyle.borderColor; -ko-border-if: buttonStyle.borderWidth > 0; -ko-padding: @[buttonStyle.verticalPadding]px; -ko-padding-left: @[buttonStyle.horizontalPadding]px; -ko-padding-right: @[buttonStyle.horizontalPadding]px; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face" bgcolor="#bfbfbf"><a href="" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face; -ko-attr-href: @buttonLink.url"><span data-ko-wrap="false" data-ko-editable="buttonLink.text">BUTTON</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table></div></td>\n' +
        '    </tr>\n' +
        '          \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '        --><!--\n' +
        '      --><!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]--></div></td></tr></table></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /sideImageBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- singleArticleBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="singleArticleBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="vertical-align:top; width:100%; max-width: 552px; -mru-width: 0px"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%" width="552">\n' +
        '          \n' +
        '          <tr data-ko-display="imageVisible"><td width="100%" valign="top" align="center" class="links-color" style="padding-bottom: 8px; padding: 9px; padding-top: 5px; padding-bottom: 13px;; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[Math.round(8) + Math.round(blockSpacing.verticalSpacing)]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 534px; -mru-width: 0px; -ko-width: @[Math.round(imageWidth) + 18 - 2 * blockSpacing.horizontalSpacing]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="image.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @image.alt; -ko-attr-alt-if: image.alt !== \'\'; width: 100%; max-width: 534px; -ko-attr-width: @[Math.round(imageWidth) + 18 - 2 * blockSpacing.horizontalSpacing]; -ko-max-width: @[Math.round(imageWidth) + 18 - 2 * blockSpacing.horizontalSpacing]px; height: auto" data-ko-editable="image.src" width="534" data-ko-placeholder-height="150" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=534%2C150"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '          <tr data-ko-display="titleVisible">\n' +
        '      <td width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 18px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; -ko-font-size: @[titleTextStyle.size]px; -ko-color: @titleTextStyle.color; -ko-font-family: @titleTextStyle.face; -ko-text-align: @titleTextStyle.align; -ko-attr-align: @titleTextStyle.align" align="left"><span style="font-weight: normal" data-ko-editable="text">Section Title</span></td>\n' +
        '    </tr>\n' +
        '          <tr><td class="long-text links-color" width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; line-height: normal; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-text-align: @longTextStyle.align; -ko-attr-align: @longTextStyle.align; -ko-line-height: @[longTextStyle.lineHeight]" align="left" data-ko-editable="longText"><p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p></td></tr>\n' +
        '          <tr data-ko-display="buttonVisible">\n' +
        '      <td valign="top" align="left" style="-ko-attr-align: @buttonStyle.align; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><table role="presentation" cellpadding="6" border="0" align="left" cellspacing="0" style="border-spacing: 0; mso-padding-alt: 6px 18px 6px 18px; margin-top: 2px; -ko-attr-cellpadding: @[Math.min(buttonStyle.verticalPadding, buttonStyle.horizontalPadding)]; -ko-mso-padding-alt: @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px; -ko-attr-align: @buttonStyle.align"><tr data-ko-display="buttonVisible">\n' +
        '        <td width="auto" valign="middle" align="center" style="text-align:center; font-weight: normal; padding: 6px; padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; border-radius: 4px; border: 0px solid #3f3f3f; -ko-border-radius: @[buttonStyle.radius]px; -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor; -ko-border: @[buttonStyle.borderWidth]px solid @buttonStyle.borderColor; -ko-border-if: buttonStyle.borderWidth > 0; -ko-padding: @[buttonStyle.verticalPadding]px; -ko-padding-left: @[buttonStyle.horizontalPadding]px; -ko-padding-right: @[buttonStyle.horizontalPadding]px; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face" bgcolor="#bfbfbf"><a href="" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face; -ko-attr-href: @buttonLink.url"><span data-ko-wrap="false" data-ko-editable="buttonLink.text">BUTTON</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '        \n' +
        '        </table></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /singleArticleBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- titleBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="titleBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 4px; padding-bottom: 4px;"><div style="vertical-align:top; width:100%; max-width: 552px; -mru-width: 0px"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%" width="552">\n' +
        '          \n' +
        '          <tr>\n' +
        '      <td width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 22px; font-family: Arial, Helvetica, sans-serif; text-align: center; -ko-font-size: @[bigTitleStyle.size]px; -ko-color: @bigTitleStyle.color; -ko-font-family: @bigTitleStyle.face; -ko-text-align: @bigTitleStyle.align; -ko-attr-align: @bigTitleStyle.align; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;" align="center"><span style="font-weight: normal" data-ko-editable="text">Section Title</span></td>\n' +
        '    </tr>\n' +
        '        \n' +
        '        </table></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /titleBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- titleBlock2 -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="titleBlock2">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="vertical-align:top; width:100%; max-width: 552px; -mru-width: 0px"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%" width="552">\n' +
        '          \n' +
        '          <tr>\n' +
        '      <td width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 22px; font-family: Arial, Helvetica, sans-serif; text-align: center; -ko-font-size: @[bigTitleStyle.size]px; -ko-color: @bigTitleStyle.color; -ko-font-family: @bigTitleStyle.face; -ko-text-align: @bigTitleStyle.align; -ko-attr-align: @bigTitleStyle.align; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;" align="center"><span style="font-weight: normal" data-ko-editable="text">Section Title</span></td>\n' +
        '    </tr>\n' +
        '        \n' +
        '        </table></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /titleBlock2 -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- textBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="textBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="vertical-align:top; width:100%; max-width: 552px; -mru-width: 0px"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%" width="552">\n' +
        '          \n' +
        '          <tr><td class="long-text links-color" width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; line-height: normal; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-text-align: @longTextStyle.align; -ko-attr-align: @longTextStyle.align; -ko-line-height: @[longTextStyle.lineHeight]" align="left" data-ko-editable="longText"><p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts.</p><p>Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p></td></tr>\n' +
        '        \n' +
        '        </table></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /textBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- tripleArticleBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="tripleArticleBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px;"><div style="width:100%; max-width: 552px; -mru-width: 0px"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="552" style="mso-padding-top-alt: 13px; mso-padding-bottom-alt: 13px; -ko-mso-padding-top-alt: @[blockSpacing.topPadding]px; -ko-mso-padding-bottom-alt: @[blockSpacing.bottomPadding]px;"><tr><![endif]--><!--\n' +
        '        --><!--\n' +
        '          --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="184"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 184px; -mru-width: 0px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px; min-width: calc(184 * 100% / 552); -ko-min-width: @[\'calc(\' + (184) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="184" align="left">\n' +
        '          \n' +
        '            <tr data-ko-display="imageVisible and fixedImageHeightVisible"><td width="100%" valign="top" align="center" class="links-color" style="padding-bottom: 8px; padding: 9px; padding-top: 5px; padding-bottom: 13px;; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[Math.round(8) + Math.round(blockSpacing.verticalSpacing)]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 166px; -mru-width: 0px; -ko-width: @[184 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="leftImage.url" data-ko-height="imageHeight"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @leftImage.alt; -ko-attr-alt-if: leftImage.alt !== \'\'; width: 100%; max-width: 166px; -ko-attr-width: @[184 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[184 - blockSpacing.horizontalSpacing * 2]px; height: auto; -ko-attr-height: @[imageHeight]" data-ko-editable="leftImage.src" width="166" height="90" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=166%2C90"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            <tr data-ko-display="imageVisible and fixedImageHeightVisible eq false" style="display: none"><td width="100%" valign="top" align="center" class="links-color" style="padding-bottom: 8px; padding: 9px; padding-top: 5px; padding-bottom: 13px;; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[Math.round(8) + Math.round(blockSpacing.verticalSpacing)]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 166px; -mru-width: 0px; -ko-width: @[184 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="leftImage.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @leftImage.alt; -ko-attr-alt-if: leftImage.alt !== \'\'; width: 100%; max-width: 166px; -ko-attr-width: @[184 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[184 - blockSpacing.horizontalSpacing * 2]px; height: auto" data-ko-editable="leftImage.src" width="166" data-ko-placeholder-height="90" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=166%2C90"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            <tr data-ko-display="titleVisible">\n' +
        '      <td width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 18px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; -ko-font-size: @[titleTextStyle.size]px; -ko-color: @titleTextStyle.color; -ko-font-family: @titleTextStyle.face; -ko-text-align: @titleTextStyle.align; -ko-attr-align: @titleTextStyle.align" align="left"><span style="font-weight: normal" data-ko-editable="leftTitleText">Title</span></td>\n' +
        '    </tr>\n' +
        '            <tr><td class="long-text links-color" width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; line-height: normal; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-text-align: @longTextStyle.align; -ko-attr-align: @longTextStyle.align; -ko-line-height: @[longTextStyle.lineHeight]" align="left" data-ko-editable="leftLongText"><p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts.</p></td></tr>\n' +
        '            <tr data-ko-display="buttonVisible">\n' +
        '      <td valign="top" align="left" style="-ko-attr-align: @buttonStyle.align; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><table role="presentation" cellpadding="6" border="0" align="left" cellspacing="0" style="border-spacing: 0; mso-padding-alt: 6px 18px 6px 18px; margin-top: 2px; -ko-attr-cellpadding: @[Math.min(buttonStyle.verticalPadding, buttonStyle.horizontalPadding)]; -ko-mso-padding-alt: @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px; -ko-attr-align: @buttonStyle.align"><tr data-ko-display="buttonVisible">\n' +
        '        <td width="auto" valign="middle" align="center" style="text-align:center; font-weight: normal; padding: 6px; padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; border-radius: 4px; border: 0px solid #3f3f3f; -ko-border-radius: @[buttonStyle.radius]px; -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor; -ko-border: @[buttonStyle.borderWidth]px solid @buttonStyle.borderColor; -ko-border-if: buttonStyle.borderWidth > 0; -ko-padding: @[buttonStyle.verticalPadding]px; -ko-padding-left: @[buttonStyle.horizontalPadding]px; -ko-padding-right: @[buttonStyle.horizontalPadding]px; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face" bgcolor="#bfbfbf"><a href="" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face; -ko-attr-href: @leftButtonLink.url"><span data-ko-wrap="false" data-ko-editable="leftButtonLink.text">BUTTON</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '          \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '        --><!--\n' +
        '          --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="184"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 184px; -mru-width: 0px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px; min-width: calc(184 * 100% / 552); -ko-min-width: @[\'calc(\' + (184) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="184" align="left">\n' +
        '          \n' +
        '            <tr data-ko-display="imageVisible and fixedImageHeightVisible"><td width="100%" valign="top" align="center" class="links-color" style="padding-bottom: 8px; padding: 9px; padding-top: 5px; padding-bottom: 13px;; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[Math.round(8) + Math.round(blockSpacing.verticalSpacing)]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 166px; -mru-width: 0px; -ko-width: @[184 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="middleImage.url" data-ko-height="imageHeight"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @middleImage.alt; -ko-attr-alt-if: middleImage.alt !== \'\'; width: 100%; max-width: 166px; -ko-attr-width: @[184 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[184 - blockSpacing.horizontalSpacing * 2]px; height: auto; -ko-attr-height: @[imageHeight]" data-ko-editable="middleImage.src" width="166" height="90" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=166%2C90"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            <tr data-ko-display="imageVisible and fixedImageHeightVisible eq false" style="display: none"><td width="100%" valign="top" align="center" class="links-color" style="padding-bottom: 8px; padding: 9px; padding-top: 5px; padding-bottom: 13px;; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[Math.round(8) + Math.round(blockSpacing.verticalSpacing)]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 166px; -mru-width: 0px; -ko-width: @[184 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="middleImage.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @middleImage.alt; -ko-attr-alt-if: middleImage.alt !== \'\'; width: 100%; max-width: 166px; -ko-attr-width: @[184 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[184 - blockSpacing.horizontalSpacing * 2]px; height: auto" data-ko-editable="middleImage.src" width="166" data-ko-placeholder-height="70" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=166%2C70"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            <tr data-ko-display="titleVisible">\n' +
        '      <td width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 18px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; -ko-font-size: @[titleTextStyle.size]px; -ko-color: @titleTextStyle.color; -ko-font-family: @titleTextStyle.face; -ko-text-align: @titleTextStyle.align; -ko-attr-align: @titleTextStyle.align" align="left"><span style="font-weight: normal" data-ko-editable="middleTitleText">Title</span></td>\n' +
        '    </tr>\n' +
        '            <tr><td class="long-text links-color" width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; line-height: normal; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-text-align: @longTextStyle.align; -ko-attr-align: @longTextStyle.align; -ko-line-height: @[longTextStyle.lineHeight]" align="left" data-ko-editable="middleLongText"><p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts.</p></td></tr>\n' +
        '            <tr data-ko-display="buttonVisible">\n' +
        '      <td valign="top" align="left" style="-ko-attr-align: @buttonStyle.align; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><table role="presentation" cellpadding="6" border="0" align="left" cellspacing="0" style="border-spacing: 0; mso-padding-alt: 6px 18px 6px 18px; margin-top: 2px; -ko-attr-cellpadding: @[Math.min(buttonStyle.verticalPadding, buttonStyle.horizontalPadding)]; -ko-mso-padding-alt: @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px; -ko-attr-align: @buttonStyle.align"><tr data-ko-display="buttonVisible">\n' +
        '        <td width="auto" valign="middle" align="center" style="text-align:center; font-weight: normal; padding: 6px; padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; border-radius: 4px; border: 0px solid #3f3f3f; -ko-border-radius: @[buttonStyle.radius]px; -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor; -ko-border: @[buttonStyle.borderWidth]px solid @buttonStyle.borderColor; -ko-border-if: buttonStyle.borderWidth > 0; -ko-padding: @[buttonStyle.verticalPadding]px; -ko-padding-left: @[buttonStyle.horizontalPadding]px; -ko-padding-right: @[buttonStyle.horizontalPadding]px; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face" bgcolor="#bfbfbf"><a href="" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face; -ko-attr-href: @middleButtonLink.url"><span data-ko-wrap="false" data-ko-editable="middleButtonLink.text">BUTTON</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '          \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '        --><!--\n' +
        '          --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="184"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 184px; -mru-width: 0px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px; min-width: calc(184 * 100% / 552); -ko-min-width: @[\'calc(\' + (184) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="184" align="left">\n' +
        '          \n' +
        '            <tr data-ko-display="imageVisible and fixedImageHeightVisible"><td width="100%" valign="top" align="center" class="links-color" style="padding-bottom: 8px; padding: 9px; padding-top: 5px; padding-bottom: 13px;; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[Math.round(8) + Math.round(blockSpacing.verticalSpacing)]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 166px; -mru-width: 0px; -ko-width: @[184 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="rightImage.url" data-ko-height="imageHeight"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @rightImage.alt; -ko-attr-alt-if: rightImage.alt !== \'\'; width: 100%; max-width: 166px; -ko-attr-width: @[184 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[184 - blockSpacing.horizontalSpacing * 2]px; height: auto; -ko-attr-height: @[imageHeight]" data-ko-editable="rightImage.src" width="166" height="90" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=166%2C90"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            <tr data-ko-display="imageVisible and fixedImageHeightVisible eq false" style="display: none"><td width="100%" valign="top" align="center" class="links-color" style="padding-bottom: 8px; padding: 9px; padding-top: 5px; padding-bottom: 13px;; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[Math.round(8) + Math.round(blockSpacing.verticalSpacing)]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 166px; -mru-width: 0px; -ko-width: @[184 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="rightImage.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @rightImage.alt; -ko-attr-alt-if: rightImage.alt !== \'\'; width: 100%; max-width: 166px; -ko-attr-width: @[184 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[184 - blockSpacing.horizontalSpacing * 2]px; height: auto" data-ko-editable="rightImage.src" width="166" data-ko-placeholder-height="110" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=166%2C110"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            <tr data-ko-display="titleVisible">\n' +
        '      <td width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 18px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; -ko-font-size: @[titleTextStyle.size]px; -ko-color: @titleTextStyle.color; -ko-font-family: @titleTextStyle.face; -ko-text-align: @titleTextStyle.align; -ko-attr-align: @titleTextStyle.align" align="left"><span style="font-weight: normal" data-ko-editable="rightTitleText">Title</span></td>\n' +
        '    </tr>\n' +
        '            <tr><td class="long-text links-color" width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; line-height: normal; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-text-align: @longTextStyle.align; -ko-attr-align: @longTextStyle.align; -ko-line-height: @[longTextStyle.lineHeight]" align="left" data-ko-editable="rightLongText"><p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts.</p></td></tr>\n' +
        '            <tr data-ko-display="buttonVisible">\n' +
        '      <td valign="top" align="left" style="-ko-attr-align: @buttonStyle.align; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><table role="presentation" cellpadding="6" border="0" align="left" cellspacing="0" style="border-spacing: 0; mso-padding-alt: 6px 18px 6px 18px; margin-top: 2px; -ko-attr-cellpadding: @[Math.min(buttonStyle.verticalPadding, buttonStyle.horizontalPadding)]; -ko-mso-padding-alt: @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px; -ko-attr-align: @buttonStyle.align"><tr data-ko-display="buttonVisible">\n' +
        '        <td width="auto" valign="middle" align="center" style="text-align:center; font-weight: normal; padding: 6px; padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; border-radius: 4px; border: 0px solid #3f3f3f; -ko-border-radius: @[buttonStyle.radius]px; -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor; -ko-border: @[buttonStyle.borderWidth]px solid @buttonStyle.borderColor; -ko-border-if: buttonStyle.borderWidth > 0; -ko-padding: @[buttonStyle.verticalPadding]px; -ko-padding-left: @[buttonStyle.horizontalPadding]px; -ko-padding-right: @[buttonStyle.horizontalPadding]px; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face" bgcolor="#bfbfbf"><a href="" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face; -ko-attr-href: @rightButtonLink.url"><span data-ko-wrap="false" data-ko-editable="rightButtonLink.text">BUTTON</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '          \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '        --><!--\n' +
        '      --><!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]--></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /tripleArticleBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- doubleArticleBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="doubleArticleBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px;"><div style="width:100%; max-width: 552px; -mru-width: 0px"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="552" style="mso-padding-top-alt: 13px; mso-padding-bottom-alt: 13px; -ko-mso-padding-top-alt: @[blockSpacing.topPadding]px; -ko-mso-padding-bottom-alt: @[blockSpacing.bottomPadding]px;"><tr><![endif]--><!--\n' +
        '        --><!--\n' +
        '            --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="276"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 276px; -mru-width: 0px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px; min-width: calc(276 * 100% / 552); -ko-min-width: @[\'calc(\' + (276) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="276" align="left">\n' +
        '          \n' +
        '              <tr data-ko-display="imageVisible and fixedImageHeightVisible"><td width="100%" valign="top" align="center" class="links-color" style="padding-bottom: 8px; padding: 9px; padding-top: 5px; padding-bottom: 13px;; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[Math.round(8) + Math.round(blockSpacing.verticalSpacing)]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 258px; -mru-width: 0px; -ko-width: @[276 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="leftImage.url" data-ko-height="imageHeight"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @leftImage.alt; -ko-attr-alt-if: leftImage.alt !== \'\'; width: 100%; max-width: 258px; -ko-attr-width: @[276 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[276 - blockSpacing.horizontalSpacing * 2]px; height: auto; -ko-attr-height: @[imageHeight]" data-ko-editable="leftImage.src" width="258" height="100" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=258%2C100"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '              <tr data-ko-display="imageVisible and fixedImageHeightVisible eq false" style="display: none"><td width="100%" valign="top" align="center" class="links-color" style="padding-bottom: 8px; padding: 9px; padding-top: 5px; padding-bottom: 13px;; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[Math.round(8) + Math.round(blockSpacing.verticalSpacing)]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 258px; -mru-width: 0px; -ko-width: @[276 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="leftImage.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @leftImage.alt; -ko-attr-alt-if: leftImage.alt !== \'\'; width: 100%; max-width: 258px; -ko-attr-width: @[276 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[276 - blockSpacing.horizontalSpacing * 2]px; height: auto" data-ko-editable="leftImage.src" width="258" data-ko-placeholder-height="90" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=258%2C90"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '              <tr data-ko-display="titleVisible">\n' +
        '      <td width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 18px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; -ko-font-size: @[titleTextStyle.size]px; -ko-color: @titleTextStyle.color; -ko-font-family: @titleTextStyle.face; -ko-text-align: @titleTextStyle.align; -ko-attr-align: @titleTextStyle.align" align="left"><span style="font-weight: normal" data-ko-editable="leftTitleText">Title</span></td>\n' +
        '    </tr>\n' +
        '              <tr><td class="long-text links-color" width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; line-height: normal; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-text-align: @longTextStyle.align; -ko-attr-align: @longTextStyle.align; -ko-line-height: @[longTextStyle.lineHeight]" align="left" data-ko-editable="leftLongText"><p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts.</p></td></tr>\n' +
        '              <tr data-ko-display="buttonVisible">\n' +
        '      <td valign="top" align="left" style="-ko-attr-align: @buttonStyle.align; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><table role="presentation" cellpadding="6" border="0" align="left" cellspacing="0" style="border-spacing: 0; mso-padding-alt: 6px 18px 6px 18px; margin-top: 2px; -ko-attr-cellpadding: @[Math.min(buttonStyle.verticalPadding, buttonStyle.horizontalPadding)]; -ko-mso-padding-alt: @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px; -ko-attr-align: @buttonStyle.align"><tr data-ko-display="buttonVisible">\n' +
        '        <td width="auto" valign="middle" align="center" style="text-align:center; font-weight: normal; padding: 6px; padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; border-radius: 4px; border: 0px solid #3f3f3f; -ko-border-radius: @[buttonStyle.radius]px; -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor; -ko-border: @[buttonStyle.borderWidth]px solid @buttonStyle.borderColor; -ko-border-if: buttonStyle.borderWidth > 0; -ko-padding: @[buttonStyle.verticalPadding]px; -ko-padding-left: @[buttonStyle.horizontalPadding]px; -ko-padding-right: @[buttonStyle.horizontalPadding]px; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face" bgcolor="#bfbfbf"><a href="" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face; -ko-attr-href: @leftButtonLink.url"><span data-ko-wrap="false" data-ko-editable="leftButtonLink.text">BUTTON</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '          --><!--\n' +
        '            --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="276"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 276px; -mru-width: 0px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px; min-width: calc(276 * 100% / 552); -ko-min-width: @[\'calc(\' + (276) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="276" align="left">\n' +
        '          \n' +
        '              <tr data-ko-display="imageVisible and fixedImageHeightVisible"><td width="100%" valign="top" align="center" class="links-color" style="padding-bottom: 8px; padding: 9px; padding-top: 5px; padding-bottom: 13px;; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[Math.round(8) + Math.round(blockSpacing.verticalSpacing)]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 258px; -mru-width: 0px; -ko-width: @[276 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="rightImage.url" data-ko-height="imageHeight"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @rightImage.alt; -ko-attr-alt-if: rightImage.alt !== \'\'; width: 100%; max-width: 258px; -ko-attr-width: @[276 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[276 - blockSpacing.horizontalSpacing * 2]px; height: auto; -ko-attr-height: @[imageHeight]" data-ko-editable="rightImage.src" width="258" height="100" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=258%2C100"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '              <tr data-ko-display="imageVisible and fixedImageHeightVisible eq false" style="display: none"><td width="100%" valign="top" align="center" class="links-color" style="padding-bottom: 8px; padding: 9px; padding-top: 5px; padding-bottom: 13px;; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[Math.round(8) + Math.round(blockSpacing.verticalSpacing)]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 258px; -mru-width: 0px; -ko-width: @[276 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="rightImage.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @rightImage.alt; -ko-attr-alt-if: rightImage.alt !== \'\'; width: 100%; max-width: 258px; -ko-attr-width: @[276 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[276 - blockSpacing.horizontalSpacing * 2]px; height: auto" data-ko-editable="rightImage.src" width="258" data-ko-placeholder-height="120" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=258%2C120"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '              <tr data-ko-display="titleVisible">\n' +
        '      <td width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 18px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; -ko-font-size: @[titleTextStyle.size]px; -ko-color: @titleTextStyle.color; -ko-font-family: @titleTextStyle.face; -ko-text-align: @titleTextStyle.align; -ko-attr-align: @titleTextStyle.align" align="left"><span style="font-weight: normal" data-ko-editable="rightTitleText">Title</span></td>\n' +
        '    </tr>\n' +
        '              <tr><td class="long-text links-color" width="100%" valign="top" style="font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; line-height: normal; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-text-align: @longTextStyle.align; -ko-attr-align: @longTextStyle.align; -ko-line-height: @[longTextStyle.lineHeight]" align="left" data-ko-editable="rightLongText"><p>Far far away, behind the word mountains, far from the countries <a href="">Vokalia and Consonantia</a>, there live the blind texts.</p></td></tr>\n' +
        '              <tr data-ko-display="buttonVisible">\n' +
        '      <td valign="top" align="left" style="-ko-attr-align: @buttonStyle.align; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><table role="presentation" cellpadding="6" border="0" align="left" cellspacing="0" style="border-spacing: 0; mso-padding-alt: 6px 18px 6px 18px; margin-top: 2px; -ko-attr-cellpadding: @[Math.min(buttonStyle.verticalPadding, buttonStyle.horizontalPadding)]; -ko-mso-padding-alt: @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px @[buttonStyle.verticalPadding]px @[buttonStyle.horizontalPadding]px; -ko-attr-align: @buttonStyle.align"><tr data-ko-display="buttonVisible">\n' +
        '        <td width="auto" valign="middle" align="center" style="text-align:center; font-weight: normal; padding: 6px; padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; border-radius: 4px; border: 0px solid #3f3f3f; -ko-border-radius: @[buttonStyle.radius]px; -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor; -ko-border: @[buttonStyle.borderWidth]px solid @buttonStyle.borderColor; -ko-border-if: buttonStyle.borderWidth > 0; -ko-padding: @[buttonStyle.verticalPadding]px; -ko-padding-left: @[buttonStyle.horizontalPadding]px; -ko-padding-right: @[buttonStyle.horizontalPadding]px; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face" bgcolor="#bfbfbf"><a href="" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[buttonStyle.size]px; -ko-color: @buttonStyle.color; -ko-font-family: @buttonStyle.face; -ko-attr-href: @rightButtonLink.url"><span data-ko-wrap="false" data-ko-editable="rightButtonLink.text">BUTTON</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '          --><!--\n' +
        '      --><!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]--></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /doubleArticleBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- hrBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="hrBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 4px; padding-bottom: 4px;"><div style="vertical-align:top; width:100%; max-width: 552px; -mru-width: 0px"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%" width="552">\n' +
        '          \n' +
        '          <tr>\n' +
        '      <td valign="top" align="center" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-spacing: 0; width: 100%; -ko-width: @[hrStyle.hrWidth]%; -ko-attr-width: @[hrStyle.hrWidth]%"><tr>\n' +
        '        <td width="100%" height="1" style="padding: 0; font-size:1px; line-height: 1px; max-height: 1px; width: 100%; background-color: #3f3f3f; line-height: 1px; max-height: 1px; overflow: hidden; -ko-background-color: @hrStyle.color; -ko-attr-height: @hrStyle.hrHeight; -ko-line-height: @[hrStyle.hrHeight]px; -ko-max-height: @[hrStyle.hrHeight]px">&nbsp;</td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '        \n' +
        '        </table></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /hrBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- hrBlock2 -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="hrBlock2">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="vertical-align:top; width:100%; max-width: 552px; -mru-width: 0px"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%" width="552">\n' +
        '          \n' +
        '          <tr>\n' +
        '      <td valign="top" align="center" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-spacing: 0; width: 100%; -ko-width: @[hrStyle.hrWidth]%; -ko-attr-width: @[hrStyle.hrWidth]%"><tr>\n' +
        '        <td width="100%" height="1" style="padding: 0; font-size:1px; line-height: 1px; max-height: 1px; width: 100%; background-color: #3f3f3f; line-height: 1px; max-height: 1px; overflow: hidden; -ko-background-color: @hrStyle.color; -ko-attr-height: @hrStyle.hrHeight; -ko-line-height: @[hrStyle.hrHeight]px; -ko-max-height: @[hrStyle.hrHeight]px">&nbsp;</td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '        \n' +
        '        </table></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /hrBlock2 -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- buttonBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="buttonBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="vertical-align:top; width:100%; max-width: 552px; -mru-width: 0px"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%" width="552">\n' +
        '          \n' +
        '          <tr>\n' +
        '      <td valign="top" align="center" style="-ko-attr-align: @bigButtonStyle.align; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><table role="presentation" cellpadding="12" border="0" align="center" cellspacing="0" style="border-spacing: 0; mso-padding-alt: 12px 14px 12px 14px; -ko-attr-cellpadding: @[Math.min(bigButtonStyle.verticalPadding, bigButtonStyle.horizontalPadding)]; -ko-mso-padding-alt: @[bigButtonStyle.verticalPadding]px @[bigButtonStyle.horizontalPadding]px @[bigButtonStyle.verticalPadding]px @[bigButtonStyle.horizontalPadding]px; -ko-attr-align: @bigButtonStyle.align"><tr>\n' +
        '        <td width="auto" valign="middle" align="center" style="text-align:center; font-weight: normal; padding: 12px; padding-left: 14px; padding-right: 14px; background-color: #bfbfbf; color: #3f3f3f; font-size: 22px; font-family: Arial, Helvetica, sans-serif; border-radius: 4px; border: 0px solid #3f3f3f; -ko-border-radius: @[bigButtonStyle.radius]px; -ko-attr-bgcolor: @bigButtonStyle.buttonColor; -ko-background-color: @bigButtonStyle.buttonColor; -ko-border: @[bigButtonStyle.borderWidth]px solid @bigButtonStyle.borderColor; -ko-border-if: bigButtonStyle.borderWidth > 0; -ko-padding: @[bigButtonStyle.verticalPadding]px; -ko-padding-left: @[bigButtonStyle.horizontalPadding]px; -ko-padding-right: @[bigButtonStyle.horizontalPadding]px; -ko-font-size: @[bigButtonStyle.size]px; -ko-color: @bigButtonStyle.color; -ko-font-family: @bigButtonStyle.face" bgcolor="#bfbfbf"><a href="" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 22px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[bigButtonStyle.size]px; -ko-color: @bigButtonStyle.color; -ko-font-family: @bigButtonStyle.face; -ko-attr-href: @link.url"><span data-ko-wrap="false" data-ko-editable="link.text">BUTTON</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '        \n' +
        '        </table></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /buttonBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- imageBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="imageBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <div data-ko-wrap="false" style="width: 100%;" data-ko-display="gutterVisible eq false"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr><td width="100%" valign="top" align="center" class="links-color"><!--[if (lte ie 8)]><div style="display: inline-block; width: 570px; -mru-width: 0px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="image.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @image.alt; -ko-attr-alt-if: image.alt !== \'\'; width: 100%; max-width: 570px; height: auto" data-ko-editable="image.src" width="570" data-ko-placeholder-height="200" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=570%2C200" class="mobile-full"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]--></div>\n' +
        '      <div data-ko-wrap="false" style="width: 100%; display: none" data-ko-display="gutterVisible"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="vertical-align:top; width:100%; max-width: 552px; -mru-width: 0px"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%" width="552">\n' +
        '          \n' +
        '          <tr><td width="100%" valign="top" align="center" class="links-color" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 534px; -mru-width: 0px; -ko-width: @[552 - 2 * blockSpacing.horizontalSpacing]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="image.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @image.alt; -ko-attr-alt-if: image.alt !== \'\'; width: 100%; max-width: 534px; -ko-attr-width: @[552 - 2 * blockSpacing.horizontalSpacing]; -ko-max-width: @[552 - 2 * blockSpacing.horizontalSpacing]px; height: auto" data-ko-editable="image.src" width="534" data-ko-placeholder-height="280" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=534%2C280"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '        \n' +
        '        </table></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]--></div>\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /imageBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- doubleImageBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="doubleImageBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <div data-ko-wrap="false" style="width: 100%;" data-ko-display="gutterVisible eq false"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0"><div style="width:100%; max-width: 570px; -mru-width: 0px"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><![endif]--><!--\n' +
        '        --><!--\n' +
        '            --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="285"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 285px; -mru-width: 0px; min-width: calc(285 * 100% / 570); -ko-min-width: @[\'calc(\' + (285) * 100 / 570 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(570 * 570px - 570 * 100%); -ko-width: @[\'calc(\'+ 570 * 570 + \'px - \' + 570 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="285" align="left">\n' +
        '          \n' +
        '              <tr data-ko-display="fixedImageHeightVisible"><td width="100%" valign="top" align="center" class="links-color"><!--[if (lte ie 8)]><div style="display: inline-block; width: 285px; -mru-width: 0px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="leftImage.url" data-ko-height="imageHeight"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @leftImage.alt; -ko-attr-alt-if: leftImage.alt !== \'\'; width: 100%; max-width: 285px; height: auto; -ko-attr-height: @[imageHeight]" data-ko-editable="leftImage.src" width="285" height="180" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=285%2C180" class="mobile-full"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '              <tr data-ko-display="fixedImageHeightVisible eq false" style="display: none"><td width="100%" valign="top" align="center" class="links-color"><!--[if (lte ie 8)]><div style="display: inline-block; width: 285px; -mru-width: 0px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="leftImage.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @leftImage.alt; -ko-attr-alt-if: leftImage.alt !== \'\'; width: 100%; max-width: 285px; height: auto" data-ko-editable="leftImage.src" width="285" data-ko-placeholder-height="180" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=285%2C180" class="mobile-full"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '          --><!--\n' +
        '            --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="285"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 285px; -mru-width: 0px; min-width: calc(285 * 100% / 570); -ko-min-width: @[\'calc(\' + (285) * 100 / 570 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(570 * 570px - 570 * 100%); -ko-width: @[\'calc(\'+ 570 * 570 + \'px - \' + 570 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="285" align="left">\n' +
        '          \n' +
        '              <tr data-ko-display="fixedImageHeightVisible"><td width="100%" valign="top" align="center" class="links-color"><!--[if (lte ie 8)]><div style="display: inline-block; width: 285px; -mru-width: 0px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="rightImage.url" data-ko-height="imageHeight"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @rightImage.alt; -ko-attr-alt-if: rightImage.alt !== \'\'; width: 100%; max-width: 285px; height: auto; -ko-attr-height: @[imageHeight]" data-ko-editable="rightImage.src" width="285" height="180" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=285%2C180" class="mobile-full"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '              <tr data-ko-display="fixedImageHeightVisible eq false" style="display: none"><td width="100%" valign="top" align="center" class="links-color"><!--[if (lte ie 8)]><div style="display: inline-block; width: 285px; -mru-width: 0px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="rightImage.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @rightImage.alt; -ko-attr-alt-if: rightImage.alt !== \'\'; width: 100%; max-width: 285px; height: auto" data-ko-editable="rightImage.src" width="285" data-ko-placeholder-height="180" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=285%2C180" class="mobile-full"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '          --><!--\n' +
        '      --><!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]--></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]--></div>\n' +
        '      <div data-ko-wrap="false" style="width: 100%; display: none" data-ko-display="gutterVisible"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="width:100%; max-width: 552px; -mru-width: 0px"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="552"><tr><![endif]--><!--\n' +
        '        --><!--\n' +
        '            --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="276"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 276px; -mru-width: 0px; min-width: calc(276 * 100% / 552); -ko-min-width: @[\'calc(\' + (276) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="276" align="left">\n' +
        '          \n' +
        '              <tr data-ko-display="fixedImageHeightVisible"><td width="100%" valign="top" align="center" class="links-color" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 258px; -mru-width: 0px; -ko-width: @[276 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="leftImage.url" data-ko-height="imageHeight"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @leftImage.alt; -ko-attr-alt-if: leftImage.alt !== \'\'; width: 100%; max-width: 258px; -ko-attr-width: @[276 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[276 - blockSpacing.horizontalSpacing * 2]px; height: auto; -ko-attr-height: @[imageHeight]" data-ko-editable="leftImage.src" width="258" height="180" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=258%2C180"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '              <tr data-ko-display="fixedImageHeightVisible eq false" style="display: none"><td width="100%" valign="top" align="center" class="links-color" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 258px; -mru-width: 0px; -ko-width: @[276 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="leftImage.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @leftImage.alt; -ko-attr-alt-if: leftImage.alt !== \'\'; width: 100%; max-width: 258px; -ko-attr-width: @[276 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[276 - blockSpacing.horizontalSpacing * 2]px; height: auto" data-ko-editable="leftImage.src" width="258" data-ko-placeholder-height="180" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=258%2C180"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '      --><!--\n' +
        '            --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="276"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 276px; -mru-width: 0px; min-width: calc(276 * 100% / 552); -ko-min-width: @[\'calc(\' + (276) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="276" align="left">\n' +
        '          \n' +
        '              <tr data-ko-display="fixedImageHeightVisible"><td width="100%" valign="top" align="center" class="links-color" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 258px; -mru-width: 0px; -ko-width: @[276 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="rightImage.url" data-ko-height="imageHeight"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @rightImage.alt; -ko-attr-alt-if: rightImage.alt !== \'\'; width: 100%; max-width: 258px; -ko-attr-width: @[276 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[276 - blockSpacing.horizontalSpacing * 2]px; height: auto; -ko-attr-height: @[imageHeight]" data-ko-editable="rightImage.src" width="258" height="180" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=258%2C180"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '              <tr data-ko-display="fixedImageHeightVisible eq false" style="display: none"><td width="100%" valign="top" align="center" class="links-color" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 258px; -mru-width: 0px; -ko-width: @[276 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="rightImage.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @rightImage.alt; -ko-attr-alt-if: rightImage.alt !== \'\'; width: 100%; max-width: 258px; -ko-attr-width: @[276 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[276 - blockSpacing.horizontalSpacing * 2]px; height: auto" data-ko-editable="rightImage.src" width="258" data-ko-placeholder-height="180" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=258%2C180"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '      --><!--\n' +
        '      --><!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]--></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]--></div>\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /doubleImageBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- tripleImageBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="tripleImageBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <div data-ko-wrap="false" style="width: 100%;" data-ko-display="gutterVisible eq false"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0"><div style="width:100%; max-width: 570px; -mru-width: 0px"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><![endif]--><!--\n' +
        '        --><!--\n' +
        '            --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="190"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 190px; -mru-width: 0px; min-width: calc(190 * 100% / 570); -ko-min-width: @[\'calc(\' + (190) * 100 / 570 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(570 * 570px - 570 * 100%); -ko-width: @[\'calc(\'+ 570 * 570 + \'px - \' + 570 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="190" align="left">\n' +
        '          \n' +
        '              <tr data-ko-display="fixedImageHeightVisible"><td width="100%" valign="top" align="center" class="links-color"><!--[if (lte ie 8)]><div style="display: inline-block; width: 190px; -mru-width: 0px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="leftImage.url" data-ko-height="imageHeight"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @leftImage.alt; -ko-attr-alt-if: leftImage.alt !== \'\'; width: 100%; max-width: 190px; height: auto; -ko-attr-height: @[imageHeight]" data-ko-editable="leftImage.src" width="190" height="160" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=190%2C160" class="mobile-full"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '              <tr data-ko-display="fixedImageHeightVisible eq false" style="display: none"><td width="100%" valign="top" align="center" class="links-color"><!--[if (lte ie 8)]><div style="display: inline-block; width: 190px; -mru-width: 0px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="leftImage.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @leftImage.alt; -ko-attr-alt-if: leftImage.alt !== \'\'; width: 100%; max-width: 190px; height: auto" data-ko-editable="leftImage.src" width="190" data-ko-placeholder-height="160" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=190%2C160" class="mobile-full"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '       --><!--\n' +
        '            --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="190"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 190px; -mru-width: 0px; min-width: calc(190 * 100% / 570); -ko-min-width: @[\'calc(\' + (190) * 100 / 570 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(570 * 570px - 570 * 100%); -ko-width: @[\'calc(\'+ 570 * 570 + \'px - \' + 570 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="190" align="left">\n' +
        '          \n' +
        '              <tr data-ko-display="fixedImageHeightVisible"><td width="100%" valign="top" align="center" class="links-color"><!--[if (lte ie 8)]><div style="display: inline-block; width: 190px; -mru-width: 0px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="middleImage.url" data-ko-height="imageHeight"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @middleImage.alt; -ko-attr-alt-if: middleImage.alt !== \'\'; width: 100%; max-width: 190px; height: auto; -ko-attr-height: @[imageHeight]" data-ko-editable="middleImage.src" width="190" height="160" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=190%2C160" class="mobile-full"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '              <tr data-ko-display="fixedImageHeightVisible eq false" style="display: none"><td width="100%" valign="top" align="center" class="links-color"><!--[if (lte ie 8)]><div style="display: inline-block; width: 190px; -mru-width: 0px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="middleImage.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @middleImage.alt; -ko-attr-alt-if: middleImage.alt !== \'\'; width: 100%; max-width: 190px; height: auto" data-ko-editable="middleImage.src" width="190" data-ko-placeholder-height="160" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=190%2C160" class="mobile-full"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '       --><!--\n' +
        '            --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="190"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 190px; -mru-width: 0px; min-width: calc(190 * 100% / 570); -ko-min-width: @[\'calc(\' + (190) * 100 / 570 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(570 * 570px - 570 * 100%); -ko-width: @[\'calc(\'+ 570 * 570 + \'px - \' + 570 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="190" align="left">\n' +
        '          \n' +
        '              <tr data-ko-display="fixedImageHeightVisible"><td width="100%" valign="top" align="center" class="links-color"><!--[if (lte ie 8)]><div style="display: inline-block; width: 190px; -mru-width: 0px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="rightImage.url" data-ko-height="imageHeight"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @rightImage.alt; -ko-attr-alt-if: rightImage.alt !== \'\'; width: 100%; max-width: 190px; height: auto; -ko-attr-height: @[imageHeight]" data-ko-editable="rightImage.src" width="190" height="160" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=190%2C160" class="mobile-full"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '              <tr data-ko-display="fixedImageHeightVisible eq false" style="display: none"><td width="100%" valign="top" align="center" class="links-color"><!--[if (lte ie 8)]><div style="display: inline-block; width: 190px; -mru-width: 0px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="rightImage.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @rightImage.alt; -ko-attr-alt-if: rightImage.alt !== \'\'; width: 100%; max-width: 190px; height: auto" data-ko-editable="rightImage.src" width="190" data-ko-placeholder-height="160" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=190%2C160" class="mobile-full"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '       --><!--\n' +
        '      --><!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]--></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]--></div>\n' +
        '      <div data-ko-wrap="false" style="width: 100%; display: none" data-ko-display="gutterVisible"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="width:100%; max-width: 552px; -mru-width: 0px"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="552"><tr><![endif]--><!--\n' +
        '        --><!--\n' +
        '            --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="184"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 184px; -mru-width: 0px; min-width: calc(184 * 100% / 552); -ko-min-width: @[\'calc(\' + (184) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="184" align="left">\n' +
        '          \n' +
        '              <tr data-ko-display="fixedImageHeightVisible"><td width="100%" valign="top" align="center" class="links-color" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 166px; -mru-width: 0px; -ko-width: @[184 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="leftImage.url" data-ko-height="imageHeight"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @leftImage.alt; -ko-attr-alt-if: leftImage.alt !== \'\'; width: 100%; max-width: 166px; -ko-attr-width: @[184 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[184 - blockSpacing.horizontalSpacing * 2]px; height: auto; -ko-attr-height: @[imageHeight]" data-ko-editable="leftImage.src" width="166" height="160" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=166%2C160"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '              <tr data-ko-display="fixedImageHeightVisible eq false" style="display: none"><td width="100%" valign="top" align="center" class="links-color" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 166px; -mru-width: 0px; -ko-width: @[184 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="leftImage.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @leftImage.alt; -ko-attr-alt-if: leftImage.alt !== \'\'; width: 100%; max-width: 166px; -ko-attr-width: @[184 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[184 - blockSpacing.horizontalSpacing * 2]px; height: auto" data-ko-editable="leftImage.src" width="166" data-ko-placeholder-height="160" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=166%2C160"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '          --><!--\n' +
        '            --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="184"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 184px; -mru-width: 0px; min-width: calc(184 * 100% / 552); -ko-min-width: @[\'calc(\' + (184) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="184" align="left">\n' +
        '          \n' +
        '              <tr data-ko-display="fixedImageHeightVisible"><td width="100%" valign="top" align="center" class="links-color" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 166px; -mru-width: 0px; -ko-width: @[184 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="middleImage.url" data-ko-height="imageHeight"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @middleImage.alt; -ko-attr-alt-if: middleImage.alt !== \'\'; width: 100%; max-width: 166px; -ko-attr-width: @[184 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[184 - blockSpacing.horizontalSpacing * 2]px; height: auto; -ko-attr-height: @[imageHeight]" data-ko-editable="middleImage.src" width="166" height="160" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=166%2C160"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '              <tr data-ko-display="fixedImageHeightVisible eq false" style="display: none"><td width="100%" valign="top" align="center" class="links-color" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 166px; -mru-width: 0px; -ko-width: @[184 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="middleImage.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @middleImage.alt; -ko-attr-alt-if: middleImage.alt !== \'\'; width: 100%; max-width: 166px; -ko-attr-width: @[184 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[184 - blockSpacing.horizontalSpacing * 2]px; height: auto" data-ko-editable="middleImage.src" width="166" data-ko-placeholder-height="160" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=166%2C160"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '          --><!--\n' +
        '            --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="184"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 184px; -mru-width: 0px; min-width: calc(184 * 100% / 552); -ko-min-width: @[\'calc(\' + (184) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="184" align="left">\n' +
        '          \n' +
        '              <tr data-ko-display="fixedImageHeightVisible"><td width="100%" valign="top" align="center" class="links-color" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 166px; -mru-width: 0px; -ko-width: @[184 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="rightImage.url" data-ko-height="imageHeight"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @rightImage.alt; -ko-attr-alt-if: rightImage.alt !== \'\'; width: 100%; max-width: 166px; -ko-attr-width: @[184 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[184 - blockSpacing.horizontalSpacing * 2]px; height: auto; -ko-attr-height: @[imageHeight]" data-ko-editable="rightImage.src" width="166" height="160" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=166%2C160"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '              <tr data-ko-display="fixedImageHeightVisible eq false" style="display: none"><td width="100%" valign="top" align="center" class="links-color" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;"><!--[if (lte ie 8)]><div style="display: inline-block; width: 166px; -mru-width: 0px; -ko-width: @[184 - blockSpacing.horizontalSpacing * 2]px"><![endif]--><a href="" style="display: inline-block;" data-ko-link="rightImage.url"><img alt="" border="0" hspace="0" align="center" vspace="0" style="vertical-align:top; height: auto; margin: 0 auto; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face; -ko-attr-alt: @rightImage.alt; -ko-attr-alt-if: rightImage.alt !== \'\'; width: 100%; max-width: 166px; -ko-attr-width: @[184 - blockSpacing.horizontalSpacing * 2]; -ko-max-width: @[184 - blockSpacing.horizontalSpacing * 2]px; height: auto" data-ko-editable="rightImage.src" width="166" data-ko-placeholder-height="160" src="https://mosaico.io/srv/f-default/img?method=placeholder&amp;params=166%2C160"></a><!--[if (lte ie 8)]></div><![endif]--></td></tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '          --><!--\n' +
        '      --><!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]--></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]--></div>\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /tripleImageBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- bigSocialBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="bigSocialBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="vertical-align:top; width:100%; max-width: 552px; -mru-width: 0px"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%" width="552">\n' +
        '          \n' +
        '          <tr><td width="100%" valign="top" style="font-weight: normal; text-align: center; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;" align="center" class="links-color socialLinks mobile-textcenter">\n' +
        '            \n' +
        '              <div data-ko-wrap="false" style="display: inline-block;" data-ko-display="fbVisible">&nbsp;<a href="" data-ko-display="fbVisible" style="border-radius: 50px; -ko-attr-href: @[fbUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/fb-\'+bigSocialIconType+\'-96.png\')]; -ko-attr-width: @[bigSocialIconSize]; -ko-attr-height: @[bigSocialIconSize]" src="img/icons/fb-rdcol-96.png" width="48" height="48" alt="Facebook"></a></div>\n' +
        '            \n' +
        '              <div data-ko-wrap="false" style="display: inline-block;" data-ko-display="twVisible">&nbsp;<a href="" data-ko-display="twVisible" style="border-radius: 50px; -ko-attr-href: @[twUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/tw-\'+bigSocialIconType+\'-96.png\')]; -ko-attr-width: @[bigSocialIconSize]; -ko-attr-height: @[bigSocialIconSize]" src="img/icons/tw-rdcol-96.png" width="48" height="48" alt="Twitter"></a></div>\n' +
        '            \n' +
        '              <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="ggVisible">&nbsp;<a href="" data-ko-display="ggVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[ggUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/gg-\'+bigSocialIconType+\'-96.png\')]; -ko-attr-width: @[bigSocialIconSize]; -ko-attr-height: @[bigSocialIconSize]" src="img/icons/gg-rdcol-96.png" width="48" height="48" alt="Google"></a></div>\n' +
        '            \n' +
        '              <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="webVisible">&nbsp;<a href="" data-ko-display="webVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[webUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/web-\'+bigSocialIconType+\'-96.png\')]; -ko-attr-width: @[bigSocialIconSize]; -ko-attr-height: @[bigSocialIconSize]" src="img/icons/web-rdcol-96.png" width="48" height="48" alt="Web"></a></div>\n' +
        '            \n' +
        '              <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="waVisible">&nbsp;<a href="" data-ko-display="waVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[waUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/wa-\'+bigSocialIconType+\'-96.png\')]; -ko-attr-width: @[bigSocialIconSize]; -ko-attr-height: @[bigSocialIconSize]" src="img/icons/wa-rdcol-96.png" width="48" height="48" alt="Whatsapp"></a></div>\n' +
        '            \n' +
        '              <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="tgVisible">&nbsp;<a href="" data-ko-display="tgVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[tgUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/tg-\'+bigSocialIconType+\'-96.png\')]; -ko-attr-width: @[bigSocialIconSize]; -ko-attr-height: @[bigSocialIconSize]" src="img/icons/tg-rdcol-96.png" width="48" height="48" alt="Telegram"></a></div>\n' +
        '            \n' +
        '              <div data-ko-wrap="false" style="display: inline-block;" data-ko-display="inVisible">&nbsp;<a href="" data-ko-display="inVisible" style="border-radius: 50px; -ko-attr-href: @[inUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/in-\'+bigSocialIconType+\'-96.png\')]; -ko-attr-width: @[bigSocialIconSize]; -ko-attr-height: @[bigSocialIconSize]" src="img/icons/in-rdcol-96.png" width="48" height="48" alt="Linkedin"></a></div>\n' +
        '            \n' +
        '              <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="piVisible">&nbsp;<a href="" data-ko-display="piVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[piUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/pi-\'+bigSocialIconType+\'-96.png\')]; -ko-attr-width: @[bigSocialIconSize]; -ko-attr-height: @[bigSocialIconSize]" src="img/icons/pi-rdcol-96.png" width="48" height="48" alt="Pinterest"></a></div>\n' +
        '            \n' +
        '              <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="flVisible">&nbsp;<a href="" data-ko-display="flVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[flUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/fl-\'+bigSocialIconType+\'-96.png\')]; -ko-attr-width: @[bigSocialIconSize]; -ko-attr-height: @[bigSocialIconSize]" src="img/icons/fl-rdcol-96.png" width="48" height="48" alt="Flickr"></a></div>\n' +
        '            \n' +
        '              <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="viVisible">&nbsp;<a href="" data-ko-display="viVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[viUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/vi-\'+bigSocialIconType+\'-96.png\')]; -ko-attr-width: @[bigSocialIconSize]; -ko-attr-height: @[bigSocialIconSize]" src="img/icons/vi-rdcol-96.png" width="48" height="48" alt="Vimeo"></a></div>\n' +
        '            \n' +
        '              <div data-ko-wrap="false" style="display: inline-block;" data-ko-display="instVisible">&nbsp;<a href="" data-ko-display="instVisible" style="border-radius: 50px; -ko-attr-href: @[instUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/inst-\'+bigSocialIconType+\'-96.png\')]; -ko-attr-width: @[bigSocialIconSize]; -ko-attr-height: @[bigSocialIconSize]" src="img/icons/inst-rdcol-96.png" width="48" height="48" alt="Instagram"></a></div>\n' +
        '            \n' +
        '              <div data-ko-wrap="false" style="display: inline-block;" data-ko-display="youVisible">&nbsp;<a href="" data-ko-display="youVisible" style="border-radius: 50px; -ko-attr-href: @[youUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/you-\'+bigSocialIconType+\'-96.png\')]; -ko-attr-width: @[bigSocialIconSize]; -ko-attr-height: @[bigSocialIconSize]" src="img/icons/you-rdcol-96.png" width="48" height="48" alt="Youtube"></a></div>\n' +
        '            \n' +
        '              <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="ttVisible">&nbsp;<a href="" data-ko-display="ttVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[ttUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/tt-\'+bigSocialIconType+\'-96.png\')]; -ko-attr-width: @[bigSocialIconSize]; -ko-attr-height: @[bigSocialIconSize]" src="img/icons/tt-rdcol-96.png" width="48" height="48" alt="TikTok"></a></div>\n' +
        '            \n' +
        '              <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="tcVisible">&nbsp;<a href="" data-ko-display="tcVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[tcUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/tc-\'+bigSocialIconType+\'-96.png\')]; -ko-attr-width: @[bigSocialIconSize]; -ko-attr-height: @[bigSocialIconSize]" src="img/icons/tc-rdcol-96.png" width="48" height="48" alt="Twitch"></a></div>\n' +
        '            \n' +
        '          </td></tr>\n' +
        '        \n' +
        '        </table></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /bigSocialBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- shareBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="shareBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <div data-ko-wrap="false" style="width: 100%;" data-ko-display="shareButtonType eq \'reverse\'"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="width:100%"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0"><tr><![endif]--><!--\n' +
        '        -->\n' +
        '          \n' +
        '            <div data-ko-wrap="false" style="display:inline-block" class="mobile-full" data-ko-display="fbVisible"><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" data-ko-display="fbVisible"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; -yandex-p: calc(2px - 3%)" align="center">\n' +
        '          \n' +
        '              <tr>\n' +
        '      <td valign="top" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; line-height: 24px;"><table role="presentation" cellpadding="0" border="0" align="center" cellspacing="6" style="border-spacing: 0; mso-cellspacing: 6px; border-collapse: separate; border-spacing: 6px; background-color: #3b5998; border-radius: 4px; -ko-border-radius: @[shareButtonStyle.radius]px;" bgcolor="#3b5998"><tr>\n' +
        '        <td class="shareIcon" valign="middle" style="font-weight: normal; padding-left: 4px; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;" width="24"><a href="http://www.facebook.com/sharer/sharer.php?u=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><img style="display: block" src="img/icons/fb-white-96.png" alt="Facebook" width="24" height="24"></a></td>\n' +
        '        <td width="auto" valign="middle" style="font-weight: normal; padding-right: 4px; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;"><a href="http://www.facebook.com/sharer/sharer.php?u=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><span data-ko-wrap="false" data-ko-editable="fbText">Share</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--></div>\n' +
        '          \n' +
        '            <div data-ko-wrap="false" style="display:inline-block" class="mobile-full" data-ko-display="twVisible"><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" data-ko-display="twVisible"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; -yandex-p: calc(2px - 3%)" align="center">\n' +
        '          \n' +
        '              <tr>\n' +
        '      <td valign="top" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; line-height: 24px;"><table role="presentation" cellpadding="0" border="0" align="center" cellspacing="6" style="border-spacing: 0; mso-cellspacing: 6px; border-collapse: separate; border-spacing: 6px; background-color: #4099FF; border-radius: 4px; -ko-border-radius: @[shareButtonStyle.radius]px;" bgcolor="#4099FF"><tr>\n' +
        '        <td class="shareIcon" valign="middle" style="font-weight: normal; padding-left: 4px; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;" width="24"><a href="http://twitter.com/share?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><img style="display: block" src="img/icons/tw-white-96.png" alt="Twitter" width="24" height="24"></a></td>\n' +
        '        <td width="auto" valign="middle" style="font-weight: normal; padding-right: 4px; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;"><a href="http://twitter.com/share?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><span data-ko-wrap="false" data-ko-editable="twText">Share</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--></div>\n' +
        '          \n' +
        '            <div data-ko-wrap="false" style="display:inline-block; display: none" class="mobile-full" data-ko-display="inVisible"><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" data-ko-display="inVisible" style="display: none"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; -yandex-p: calc(2px - 3%)" align="center">\n' +
        '          \n' +
        '              <tr>\n' +
        '      <td valign="top" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; line-height: 24px;"><table role="presentation" cellpadding="0" border="0" align="center" cellspacing="6" style="border-spacing: 0; mso-cellspacing: 6px; border-collapse: separate; border-spacing: 6px; background-color: #007bb6; border-radius: 4px; -ko-border-radius: @[shareButtonStyle.radius]px;" bgcolor="#007bb6"><tr>\n' +
        '        <td class="shareIcon" valign="middle" style="font-weight: normal; padding-left: 4px; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;" width="24"><a href="http://www.linkedin.com/shareArticle?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><img style="display: block" src="img/icons/in-white-96.png" alt="LinkedIn" width="24" height="24"></a></td>\n' +
        '        <td width="auto" valign="middle" style="font-weight: normal; padding-right: 4px; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;"><a href="http://www.linkedin.com/shareArticle?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><span data-ko-wrap="false" data-ko-editable="inText">Share</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--></div>\n' +
        '          \n' +
        '            <div data-ko-wrap="false" style="display:inline-block; display: none" class="mobile-full" data-ko-display="ggVisible"><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" data-ko-display="ggVisible" style="display: none"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; -yandex-p: calc(2px - 3%)" align="center">\n' +
        '          \n' +
        '              <tr>\n' +
        '      <td valign="top" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; line-height: 24px;"><table role="presentation" cellpadding="0" border="0" align="center" cellspacing="6" style="border-spacing: 0; mso-cellspacing: 6px; border-collapse: separate; border-spacing: 6px; background-color: #d34836; border-radius: 4px; -ko-border-radius: @[shareButtonStyle.radius]px;" bgcolor="#d34836"><tr>\n' +
        '        <td class="shareIcon" valign="middle" style="font-weight: normal; padding-left: 4px; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;" width="24"><a href="http://plus.google.com/share?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><img style="display: block" src="img/icons/gg-white-96.png" alt="Google+" width="24" height="24"></a></td>\n' +
        '        <td width="auto" valign="middle" style="font-weight: normal; padding-right: 4px; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;"><a href="http://plus.google.com/share?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><span data-ko-wrap="false" data-ko-editable="ggText">Share</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--></div>\n' +
        '          \n' +
        '            <div data-ko-wrap="false" style="display:inline-block; display: none" class="mobile-full" data-ko-display="piVisible"><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" data-ko-display="piVisible" style="display: none"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; -yandex-p: calc(2px - 3%)" align="center">\n' +
        '          \n' +
        '              <tr>\n' +
        '      <td valign="top" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; line-height: 24px;"><table role="presentation" cellpadding="0" border="0" align="center" cellspacing="6" style="border-spacing: 0; mso-cellspacing: 6px; border-collapse: separate; border-spacing: 6px; background-color: #C92228; border-radius: 4px; -ko-border-radius: @[shareButtonStyle.radius]px;" bgcolor="#C92228"><tr>\n' +
        '        <td class="shareIcon" valign="middle" style="font-weight: normal; padding-left: 4px; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;" width="24"><a href="http://pinterest.com/pin/find/?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><img style="display: block" src="img/icons/pi-white-96.png" alt="Pinterest" width="24" height="24"></a></td>\n' +
        '        <td width="auto" valign="middle" style="font-weight: normal; padding-right: 4px; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;"><a href="http://pinterest.com/pin/find/?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #FFFFFF; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><span data-ko-wrap="false" data-ko-editable="piText">Share</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--></div>\n' +
        '          \n' +
        '        <!--\n' +
        '      --><!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]--></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]--></div>\n' +
        '      <div data-ko-wrap="false" style="width: 100%; display: none" data-ko-display="shareButtonType eq \'simple\'"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="width:100%"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0"><tr><![endif]--><!--\n' +
        '        -->\n' +
        '          \n' +
        '            <div data-ko-wrap="false" style="display:inline-block" class="mobile-full" data-ko-display="fbVisible"><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" data-ko-display="fbVisible"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; -yandex-p: calc(2px - 3%)" align="center">\n' +
        '          \n' +
        '              <tr>\n' +
        '      <td valign="top" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; line-height: 24px;"><table role="presentation" cellpadding="0" border="0" align="center" cellspacing="6" style="border-spacing: 0; mso-cellspacing: 6px; border-collapse: separate; border-spacing: 6px; background-color: #FFFFFF; border-radius: 4px" bgcolor="#FFFFFF"><tr>\n' +
        '        <td class="shareIcon" valign="middle" style="font-weight: normal; padding-left: 4px; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;" width="24"><a href="http://www.facebook.com/sharer/sharer.php?u=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><img style="display: block" src="img/icons/fb-coloured-96.png" alt="Facebook" width="24" height="24"></a></td>\n' +
        '        <td width="auto" valign="middle" style="font-weight: normal; padding-right: 4px; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;"><a href="http://www.facebook.com/sharer/sharer.php?u=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><span data-ko-wrap="false" data-ko-editable="fbText">Share</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--></div>\n' +
        '          \n' +
        '            <div data-ko-wrap="false" style="display:inline-block" class="mobile-full" data-ko-display="twVisible"><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" data-ko-display="twVisible"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; -yandex-p: calc(2px - 3%)" align="center">\n' +
        '          \n' +
        '              <tr>\n' +
        '      <td valign="top" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; line-height: 24px;"><table role="presentation" cellpadding="0" border="0" align="center" cellspacing="6" style="border-spacing: 0; mso-cellspacing: 6px; border-collapse: separate; border-spacing: 6px; background-color: #FFFFFF; border-radius: 4px" bgcolor="#FFFFFF"><tr>\n' +
        '        <td class="shareIcon" valign="middle" style="font-weight: normal; padding-left: 4px; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;" width="24"><a href="http://twitter.com/share?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><img style="display: block" src="img/icons/tw-coloured-96.png" alt="Twitter" width="24" height="24"></a></td>\n' +
        '        <td width="auto" valign="middle" style="font-weight: normal; padding-right: 4px; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;"><a href="http://twitter.com/share?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><span data-ko-wrap="false" data-ko-editable="twText">Share</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--></div>\n' +
        '          \n' +
        '            <div data-ko-wrap="false" style="display:inline-block; display: none" class="mobile-full" data-ko-display="inVisible"><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" data-ko-display="inVisible" style="display: none"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; -yandex-p: calc(2px - 3%)" align="center">\n' +
        '          \n' +
        '              <tr>\n' +
        '      <td valign="top" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; line-height: 24px;"><table role="presentation" cellpadding="0" border="0" align="center" cellspacing="6" style="border-spacing: 0; mso-cellspacing: 6px; border-collapse: separate; border-spacing: 6px; background-color: #FFFFFF; border-radius: 4px" bgcolor="#FFFFFF"><tr>\n' +
        '        <td class="shareIcon" valign="middle" style="font-weight: normal; padding-left: 4px; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;" width="24"><a href="http://www.linkedin.com/shareArticle?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><img style="display: block" src="img/icons/in-coloured-96.png" alt="LinkedIn" width="24" height="24"></a></td>\n' +
        '        <td width="auto" valign="middle" style="font-weight: normal; padding-right: 4px; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;"><a href="http://www.linkedin.com/shareArticle?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><span data-ko-wrap="false" data-ko-editable="inText">Share</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--></div>\n' +
        '          \n' +
        '            <div data-ko-wrap="false" style="display:inline-block; display: none" class="mobile-full" data-ko-display="ggVisible"><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" data-ko-display="ggVisible" style="display: none"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; -yandex-p: calc(2px - 3%)" align="center">\n' +
        '          \n' +
        '              <tr>\n' +
        '      <td valign="top" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; line-height: 24px;"><table role="presentation" cellpadding="0" border="0" align="center" cellspacing="6" style="border-spacing: 0; mso-cellspacing: 6px; border-collapse: separate; border-spacing: 6px; background-color: #FFFFFF; border-radius: 4px" bgcolor="#FFFFFF"><tr>\n' +
        '        <td class="shareIcon" valign="middle" style="font-weight: normal; padding-left: 4px; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;" width="24"><a href="http://plus.google.com/share?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><img style="display: block" src="img/icons/gg-coloured-96.png" alt="Google+" width="24" height="24"></a></td>\n' +
        '        <td width="auto" valign="middle" style="font-weight: normal; padding-right: 4px; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;"><a href="http://plus.google.com/share?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><span data-ko-wrap="false" data-ko-editable="ggText">Share</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--></div>\n' +
        '          \n' +
        '            <div data-ko-wrap="false" style="display:inline-block; display: none" class="mobile-full" data-ko-display="piVisible"><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" data-ko-display="piVisible" style="display: none"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; -yandex-p: calc(2px - 3%)" align="center">\n' +
        '          \n' +
        '              <tr>\n' +
        '      <td valign="top" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; line-height: 24px;"><table role="presentation" cellpadding="0" border="0" align="center" cellspacing="6" style="border-spacing: 0; mso-cellspacing: 6px; border-collapse: separate; border-spacing: 6px; background-color: #FFFFFF; border-radius: 4px" bgcolor="#FFFFFF"><tr>\n' +
        '        <td class="shareIcon" valign="middle" style="font-weight: normal; padding-left: 4px; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;" width="24"><a href="http://pinterest.com/pin/find/?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><img style="display: block" src="img/icons/pi-coloured-96.png" alt="Pinterest" width="24" height="24"></a></td>\n' +
        '        <td width="auto" valign="middle" style="font-weight: normal; padding-right: 4px; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;"><a href="http://pinterest.com/pin/find/?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #000000; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><span data-ko-wrap="false" data-ko-editable="piText">Share</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--></div>\n' +
        '          \n' +
        '        <!--\n' +
        '      --><!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]--></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]--></div>\n' +
        '      <div data-ko-wrap="false" style="width: 100%; display: none" data-ko-display="shareButtonType eq \'custom\'"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 13px; padding-bottom: 13px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="width:100%"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0"><tr><![endif]--><!--\n' +
        '        -->\n' +
        '          \n' +
        '            <div data-ko-wrap="false" style="display:inline-block" class="mobile-full" data-ko-display="fbVisible"><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" data-ko-display="fbVisible"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; -yandex-p: calc(2px - 3%)" align="center">\n' +
        '          \n' +
        '              <tr>\n' +
        '      <td valign="top" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; line-height: 24px;"><table role="presentation" cellpadding="0" border="0" align="center" cellspacing="6" style="border-spacing: 0; mso-cellspacing: 6px; border-collapse: separate; border-spacing: 6px; background-color: #bfbfbf; border-radius: 4px; -ko-attr-bgcolor: @shareButtonStyle.buttonColor; -ko-background-color: @shareButtonStyle.buttonColor; -ko-border-radius: @[shareButtonStyle.radius]px;" bgcolor="#bfbfbf"><tr>\n' +
        '        <td class="shareIcon" valign="middle" style="font-weight: normal; padding-left: 4px; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;" width="24"><a href="http://www.facebook.com/sharer/sharer.php?u=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><img style="display: block; -ko-attr-src: @[Url.templatePath(\'img/icons/fb-\'+shareButtonStyle.iconColorType+\'-96.png\')]" src="img/icons/fb-black-96.png" alt="Facebook" width="24" height="24"></a></td>\n' +
        '        <td width="auto" valign="middle" style="font-weight: normal; padding-right: 4px; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;"><a href="http://www.facebook.com/sharer/sharer.php?u=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><span data-ko-wrap="false" data-ko-editable="fbText">Share</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--></div>\n' +
        '          \n' +
        '            <div data-ko-wrap="false" style="display:inline-block" class="mobile-full" data-ko-display="twVisible"><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" data-ko-display="twVisible"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; -yandex-p: calc(2px - 3%)" align="center">\n' +
        '          \n' +
        '              <tr>\n' +
        '      <td valign="top" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; line-height: 24px;"><table role="presentation" cellpadding="0" border="0" align="center" cellspacing="6" style="border-spacing: 0; mso-cellspacing: 6px; border-collapse: separate; border-spacing: 6px; background-color: #bfbfbf; border-radius: 4px; -ko-attr-bgcolor: @shareButtonStyle.buttonColor; -ko-background-color: @shareButtonStyle.buttonColor; -ko-border-radius: @[shareButtonStyle.radius]px;" bgcolor="#bfbfbf"><tr>\n' +
        '        <td class="shareIcon" valign="middle" style="font-weight: normal; padding-left: 4px; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;" width="24"><a href="http://twitter.com/share?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><img style="display: block; -ko-attr-src: @[Url.templatePath(\'img/icons/tw-\'+shareButtonStyle.iconColorType+\'-96.png\')]" src="img/icons/tw-black-96.png" alt="Twitter" width="24" height="24"></a></td>\n' +
        '        <td width="auto" valign="middle" style="font-weight: normal; padding-right: 4px; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;"><a href="http://twitter.com/share?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><span data-ko-wrap="false" data-ko-editable="twText">Share</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--></div>\n' +
        '          \n' +
        '            <div data-ko-wrap="false" style="display:inline-block; display: none" class="mobile-full" data-ko-display="inVisible"><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" data-ko-display="inVisible" style="display: none"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; -yandex-p: calc(2px - 3%)" align="center">\n' +
        '          \n' +
        '              <tr>\n' +
        '      <td valign="top" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; line-height: 24px;"><table role="presentation" cellpadding="0" border="0" align="center" cellspacing="6" style="border-spacing: 0; mso-cellspacing: 6px; border-collapse: separate; border-spacing: 6px; background-color: #bfbfbf; border-radius: 4px; -ko-attr-bgcolor: @shareButtonStyle.buttonColor; -ko-background-color: @shareButtonStyle.buttonColor; -ko-border-radius: @[shareButtonStyle.radius]px;" bgcolor="#bfbfbf"><tr>\n' +
        '        <td class="shareIcon" valign="middle" style="font-weight: normal; padding-left: 4px; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;" width="24"><a href="http://www.linkedin.com/shareArticle?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><img style="display: block; -ko-attr-src: @[Url.templatePath(\'img/icons/in-\'+shareButtonStyle.iconColorType+\'-96.png\')]" src="img/icons/in-black-96.png" alt="LinkedIn" width="24" height="24"></a></td>\n' +
        '        <td width="auto" valign="middle" style="font-weight: normal; padding-right: 4px; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;"><a href="http://www.linkedin.com/shareArticle?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><span data-ko-wrap="false" data-ko-editable="inText">Share</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--></div>\n' +
        '          \n' +
        '            <div data-ko-wrap="false" style="display:inline-block; display: none" class="mobile-full" data-ko-display="ggVisible"><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" data-ko-display="ggVisible" style="display: none"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; -yandex-p: calc(2px - 3%)" align="center">\n' +
        '          \n' +
        '              <tr>\n' +
        '      <td valign="top" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; line-height: 24px;"><table role="presentation" cellpadding="0" border="0" align="center" cellspacing="6" style="border-spacing: 0; mso-cellspacing: 6px; border-collapse: separate; border-spacing: 6px; background-color: #bfbfbf; border-radius: 4px; -ko-attr-bgcolor: @shareButtonStyle.buttonColor; -ko-background-color: @shareButtonStyle.buttonColor; -ko-border-radius: @[shareButtonStyle.radius]px;" bgcolor="#bfbfbf"><tr>\n' +
        '        <td class="shareIcon" valign="middle" style="font-weight: normal; padding-left: 4px; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;" width="24"><a href="http://plus.google.com/share?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><img style="display: block; -ko-attr-src: @[Url.templatePath(\'img/icons/gg-\'+shareButtonStyle.iconColorType+\'-96.png\')]" src="img/icons/gg-black-96.png" alt="Google+" width="24" height="24"></a></td>\n' +
        '        <td width="auto" valign="middle" style="font-weight: normal; padding-right: 4px; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;"><a href="http://plus.google.com/share?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><span data-ko-wrap="false" data-ko-editable="ggText">Share</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--></div>\n' +
        '          \n' +
        '            <div data-ko-wrap="false" style="display:inline-block; display: none" class="mobile-full" data-ko-display="piVisible"><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" data-ko-display="piVisible" style="display: none"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; -yandex-p: calc(2px - 3%)" align="center">\n' +
        '          \n' +
        '              <tr>\n' +
        '      <td valign="top" style="padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; line-height: 24px;"><table role="presentation" cellpadding="0" border="0" align="center" cellspacing="6" style="border-spacing: 0; mso-cellspacing: 6px; border-collapse: separate; border-spacing: 6px; background-color: #bfbfbf; border-radius: 4px; -ko-attr-bgcolor: @shareButtonStyle.buttonColor; -ko-background-color: @shareButtonStyle.buttonColor; -ko-border-radius: @[shareButtonStyle.radius]px;" bgcolor="#bfbfbf"><tr>\n' +
        '        <td class="shareIcon" valign="middle" style="font-weight: normal; padding-left: 4px; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;" width="24"><a href="http://pinterest.com/pin/find/?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><img style="display: block; -ko-attr-src: @[Url.templatePath(\'img/icons/pi-\'+shareButtonStyle.iconColorType+\'-96.png\')]" src="img/icons/pi-black-96.png" alt="Pinterest" width="24" height="24"></a></td>\n' +
        '        <td width="auto" valign="middle" style="font-weight: normal; padding-right: 4px; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face; line-height: 24px;"><a href="http://pinterest.com/pin/find/?url=%5Bpermlink_urlenc%5D" style="text-decoration: none; font-weight: normal; color: #3f3f3f; font-size: 13px; font-family: Arial, Helvetica, sans-serif; -ko-color: @shareButtonStyle.color; -ko-font-size: @[shareButtonStyle.size]px; -ko-font-family: @shareButtonStyle.face"><span data-ko-wrap="false" data-ko-editable="piText">Share</span></a></td>\n' +
        '      </tr></table></td>\n' +
        '    </tr>\n' +
        '            \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--></div>\n' +
        '          \n' +
        '        <!--\n' +
        '      --><!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]--></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]--></div>\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /shareBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- spacerBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#bfbfbf" style="background-color: #bfbfbf; -ko-background-color: @[externalBackgroundColor]; -ko-attr-bgcolor: @[externalBackgroundColor]" data-ko-block="spacerBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0; font-size:1px; height: 1px; height: 24px; -ko-height: @[spacerSize]px; -ko-attr-height: @[spacerSize]" height="24">\n' +
        '      <div data-ko-wrap="false" style="width: 100%; display: none" data-ko-display="externalBackgroundVisible eq false"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; background-color: #ffffff; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]; max-width: 570px; -mru-width: 0px" bgcolor="#ffffff" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '        <td width="100%" height="24" style="padding: 0; font-size:1px; line-height: 1px; width: 100%; line-height: 24px; -ko-line-height: @[spacerSize]px; -ko-attr-height: @[spacerSize]" data-ko-height="spacerSize">&nbsp;</td>\n' +
        '      </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]--></div>\n' +
        '      <div data-ko-height="spacerSize" style="height: 24px; -ko-height: @[spacerSize]px" data-ko-display="externalBackgroundVisible" data-ko-wrap="false">&nbsp;</div>\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /spacerBlock -->\n' +
        '    \n' +
        '\n' +
        '    \n' +
        '    <!-- socialBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#3f3f3f" style="background-color: #3f3f3f; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]" data-ko-block="socialBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '      <!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="9" style="border-collapse: collapse; width: 100%; max-width: 570px; -mru-width: 0px" width="570">\n' +
        '        \n' +
        '        <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 9px; padding-bottom: 9px;"><div style="width:100%; max-width: 552px; -mru-width: 0px"><!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="552" style="mso-padding-top-alt: 4px; mso-padding-bottom-alt: 4px; -ko-mso-padding-top-alt: @[blockSpacing.topPadding]px; -ko-mso-padding-bottom-alt: @[blockSpacing.bottomPadding]px;"><tr><![endif]--><!--\n' +
        '        --><!--\n' +
        '          --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="276"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 276px; -mru-width: 0px; padding-top: 4px; padding-bottom: 4px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px; min-width: calc(276 * 100% / 552); -ko-min-width: @[\'calc(\' + (276) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="276" align="left">\n' +
        '          \n' +
        '            <tr><td class="long-text links-color" width="100%" valign="top" style="font-weight: normal; color: #919191; font-size: 13px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: left; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face" align="left" data-ko-editable="longText"><p>Address and <a href="">Contacts</a></p></td></tr>\n' +
        '          \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '          --><!--[if (gte mso 9)|(lte ie 8)]><td align="left" valign="top" width="276"><![endif]--><!--\n' +
        '      --><div style="display:inline-block; vertical-align:top; width: 100%; max-width: 276px; -mru-width: 0px; padding-top: 4px; padding-bottom: 4px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px; min-width: calc(276 * 100% / 552); -ko-min-width: @[\'calc(\' + (276) * 100 / 552 + \'%)\']; max-width: calc(100%); -ko-max-width: @[\'calc(100%)\']; width: calc(552 * 552px - 552 * 100%); -ko-width: @[\'calc(\'+ 552 * 552 + \'px - \' + 552 * 100 +\'%)\']" class="mobile-full"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%; -yandex-p: calc(2px - 3%)" width="276" align="left">\n' +
        '          \n' +
        '            <tr data-ko-display="socialIconType eq \'colors\'"><td width="100%" valign="top" style="font-weight: normal; text-align: right; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;" align="right" class="links-color socialLinks mobile-textcenter">\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block;" data-ko-display="fbVisible">&nbsp;<a href="" data-ko-display="fbVisible" style="background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #3b5998; border-radius: 50px; -ko-attr-href: @[fbUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/fb-colors-96.png" width="32" height="32" alt="Facebook"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block;" data-ko-display="twVisible">&nbsp;<a href="" data-ko-display="twVisible" style="background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #4099FF; border-radius: 50px; -ko-attr-href: @[twUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/tw-colors-96.png" width="32" height="32" alt="Twitter"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="ggVisible">&nbsp;<a href="" data-ko-display="ggVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #d34836; border-radius: 50px; -ko-attr-href: @[ggUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/gg-colors-96.png" width="32" height="32" alt="Google"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="webVisible">&nbsp;<a href="" data-ko-display="webVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #606060; border-radius: 50px; -ko-attr-href: @[webUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/web-colors-96.png" width="32" height="32" alt="Web"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="waVisible">&nbsp;<a href="" data-ko-display="waVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #25d366; border-radius: 50px; -ko-attr-href: @[waUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/wa-colors-96.png" width="32" height="32" alt="Whatsapp"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="tgVisible">&nbsp;<a href="" data-ko-display="tgVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #2da5e1; border-radius: 50px; -ko-attr-href: @[tgUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/tg-colors-96.png" width="32" height="32" alt="Telegram"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="inVisible">&nbsp;<a href="" data-ko-display="inVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #007bb6; border-radius: 50px; -ko-attr-href: @[inUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/in-colors-96.png" width="32" height="32" alt="Linkedin"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="piVisible">&nbsp;<a href="" data-ko-display="piVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #C92228; border-radius: 50px; -ko-attr-href: @[piUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/pi-colors-96.png" width="32" height="32" alt="Pinterest"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="flVisible">&nbsp;<a href="" data-ko-display="flVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #ff0084; border-radius: 50px; -ko-attr-href: @[flUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/fl-colors-96.png" width="32" height="32" alt="Flickr"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="viVisible">&nbsp;<a href="" data-ko-display="viVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #45bbff; border-radius: 50px; -ko-attr-href: @[viUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/vi-colors-96.png" width="32" height="32" alt="Vimeo"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block;" data-ko-display="instVisible">&nbsp;<a href="" data-ko-display="instVisible" style="background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #bc2a8d; border-radius: 50px; -ko-attr-href: @[instUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/inst-colors-96.png" width="32" height="32" alt="Instagram"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="youVisible">&nbsp;<a href="" data-ko-display="youVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #cd201f; border-radius: 50px; -ko-attr-href: @[youUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/you-colors-96.png" width="32" height="32" alt="Youtube"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="ttVisible">&nbsp;<a href="" data-ko-display="ttVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #000000; border-radius: 50px; -ko-attr-href: @[ttUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/tt-colors-96.png" width="32" height="32" alt="TikTok"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="tcVisible">&nbsp;<a href="" data-ko-display="tcVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #9146ff; border-radius: 50px; -ko-attr-href: @[tcUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/tc-colors-96.png" width="32" height="32" alt="Twitch"></a></div>\n' +
        '              \n' +
        '            </td></tr>\n' +
        '            <tr data-ko-display="socialIconType eq \'bw\'" style="display: none"><td width="100%" valign="top" style="font-weight: normal; text-align: right; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;" align="right" class="links-color socialLinks mobile-textcenter">\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block;" data-ko-display="fbVisible">&nbsp;<a href="" data-ko-display="fbVisible" style="background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #818181; border-radius: 50px; -ko-attr-href: @[fbUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/fb-bw-96.png" width="32" height="32" alt="Facebook"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block;" data-ko-display="twVisible">&nbsp;<a href="" data-ko-display="twVisible" style="background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #818181; border-radius: 50px; -ko-attr-href: @[twUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/tw-bw-96.png" width="32" height="32" alt="Twitter"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="ggVisible">&nbsp;<a href="" data-ko-display="ggVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #818181; border-radius: 50px; -ko-attr-href: @[ggUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/gg-bw-96.png" width="32" height="32" alt="Google"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="webVisible">&nbsp;<a href="" data-ko-display="webVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #818181; border-radius: 50px; -ko-attr-href: @[webUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/web-bw-96.png" width="32" height="32" alt="Web"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="waVisible">&nbsp;<a href="" data-ko-display="waVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #818181; border-radius: 50px; -ko-attr-href: @[waUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/wa-bw-96.png" width="32" height="32" alt="Whatsapp"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="tgVisible">&nbsp;<a href="" data-ko-display="tgVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #818181; border-radius: 50px; -ko-attr-href: @[tgUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/tg-bw-96.png" width="32" height="32" alt="Telegram"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="inVisible">&nbsp;<a href="" data-ko-display="inVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #818181; border-radius: 50px; -ko-attr-href: @[inUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/in-bw-96.png" width="32" height="32" alt="Linkedin"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="piVisible">&nbsp;<a href="" data-ko-display="piVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #818181; border-radius: 50px; -ko-attr-href: @[piUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/pi-bw-96.png" width="32" height="32" alt="Pinterest"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="flVisible">&nbsp;<a href="" data-ko-display="flVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #818181; border-radius: 50px; -ko-attr-href: @[flUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/fl-bw-96.png" width="32" height="32" alt="Flickr"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="viVisible">&nbsp;<a href="" data-ko-display="viVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #818181; border-radius: 50px; -ko-attr-href: @[viUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/vi-bw-96.png" width="32" height="32" alt="Vimeo"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block;" data-ko-display="instVisible">&nbsp;<a href="" data-ko-display="instVisible" style="background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #818181; border-radius: 50px; -ko-attr-href: @[instUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/inst-bw-96.png" width="32" height="32" alt="Instagram"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="youVisible">&nbsp;<a href="" data-ko-display="youVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #818181; border-radius: 50px; -ko-attr-href: @[youUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/you-bw-96.png" width="32" height="32" alt="Youtube"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="ttVisible">&nbsp;<a href="" data-ko-display="ttVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #818181; border-radius: 50px; -ko-attr-href: @[ttUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/tt-bw-96.png" width="32" height="32" alt="TikTok"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="tcVisible">&nbsp;<a href="" data-ko-display="tcVisible" style="display: none; background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), #818181; border-radius: 50px; -ko-attr-href: @[tcUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px" src="img/icons/tc-bw-96.png" width="32" height="32" alt="Twitch"></a></div>\n' +
        '              \n' +
        '            </td></tr>\n' +
        '            <tr data-ko-display="socialIconType neq \'colors\' and socialIconType neq \'bw\'" style="display: none"><td width="100%" valign="top" style="font-weight: normal; text-align: right; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;" align="right" class="links-color socialLinks mobile-textcenter">\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block;" data-ko-display="fbVisible">&nbsp;<a href="" data-ko-display="fbVisible" style="border-radius: 50px; -ko-attr-href: @[fbUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/fb-\'+socialIconType+\'-96.png\')]" src="img/icons/fb-rdcol-96.png" width="32" height="32" alt="Facebook"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block;" data-ko-display="twVisible">&nbsp;<a href="" data-ko-display="twVisible" style="border-radius: 50px; -ko-attr-href: @[twUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/tw-\'+socialIconType+\'-96.png\')]" src="img/icons/tw-rdcol-96.png" width="32" height="32" alt="Twitter"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="ggVisible">&nbsp;<a href="" data-ko-display="ggVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[ggUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/gg-\'+socialIconType+\'-96.png\')]" src="img/icons/gg-rdcol-96.png" width="32" height="32" alt="Google"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="webVisible">&nbsp;<a href="" data-ko-display="webVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[webUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/web-\'+socialIconType+\'-96.png\')]" src="img/icons/web-rdcol-96.png" width="32" height="32" alt="Web"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="waVisible">&nbsp;<a href="" data-ko-display="waVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[waUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/wa-\'+socialIconType+\'-96.png\')]" src="img/icons/wa-rdcol-96.png" width="32" height="32" alt="Whatsapp"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="tgVisible">&nbsp;<a href="" data-ko-display="tgVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[tgUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/tg-\'+socialIconType+\'-96.png\')]" src="img/icons/tg-rdcol-96.png" width="32" height="32" alt="Telegram"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="inVisible">&nbsp;<a href="" data-ko-display="inVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[inUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/in-\'+socialIconType+\'-96.png\')]" src="img/icons/in-rdcol-96.png" width="32" height="32" alt="Linkedin"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="piVisible">&nbsp;<a href="" data-ko-display="piVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[piUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/pi-\'+socialIconType+\'-96.png\')]" src="img/icons/pi-rdcol-96.png" width="32" height="32" alt="Pinterest"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="flVisible">&nbsp;<a href="" data-ko-display="flVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[flUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/fl-\'+socialIconType+\'-96.png\')]" src="img/icons/fl-rdcol-96.png" width="32" height="32" alt="Flickr"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="viVisible">&nbsp;<a href="" data-ko-display="viVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[viUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/vi-\'+socialIconType+\'-96.png\')]" src="img/icons/vi-rdcol-96.png" width="32" height="32" alt="Vimeo"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block;" data-ko-display="instVisible">&nbsp;<a href="" data-ko-display="instVisible" style="border-radius: 50px; -ko-attr-href: @[instUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/inst-\'+socialIconType+\'-96.png\')]" src="img/icons/inst-rdcol-96.png" width="32" height="32" alt="Instagram"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="youVisible">&nbsp;<a href="" data-ko-display="youVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[youUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/you-\'+socialIconType+\'-96.png\')]" src="img/icons/you-rdcol-96.png" width="32" height="32" alt="Youtube"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="ttVisible">&nbsp;<a href="" data-ko-display="ttVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[ttUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/tt-\'+socialIconType+\'-96.png\')]" src="img/icons/tt-rdcol-96.png" width="32" height="32" alt="TikTok"></a></div>\n' +
        '              \n' +
        '                <div data-ko-wrap="false" style="display: inline-block; display: none" data-ko-display="tcVisible">&nbsp;<a href="" data-ko-display="tcVisible" style="display: none; border-radius: 50px; -ko-attr-href: @[tcUrl]"><img border="0" style="display: inline-block; vertical-align: top; padding-bottom: 0px; -ko-attr-src: @[Url.templatePath(\'img/icons/tc-\'+socialIconType+\'-96.png\')]" src="img/icons/tc-rdcol-96.png" width="32" height="32" alt="Twitch"></a></div>\n' +
        '              \n' +
        '            </td></tr>\n' +
        '          \n' +
        '        </table><!--\n' +
        '      --></div><!--[if (gte mso 9)|(lte ie 8)]></td><![endif]--><!--\n' +
        '        --><!--\n' +
        '      --><!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]--></div></td>\n' +
        '    </tr>\n' +
        '      \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
        '    </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /socialBlock -->\n' +
        '    \n' +
        '\n' +
        '  </div>\n' +
        '\n' +
        '  \n' +
        '    <!-- footerBlock -->\n' +
        '    <table role="presentation" class="vb-outer" width="100%" cellpadding="0" border="0" cellspacing="0" bgcolor="#3f3f3f" style="background-color: #3f3f3f; -ko-background-color: @[backgroundColor]; -ko-attr-bgcolor: @[backgroundColor]" data-ko-block="footerBlock">\n' +
        '      <tr><td class="vb-outer" align="center" valign="top" style="padding-left: 9px; padding-right: 9px; font-size: 0">\n' +
        '    <!--[if (gte mso 9)|(lte ie 8)]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="570"><tr><td align="center" valign="top"><![endif]--><!--\n' +
        '      --><div style="margin: 0 auto; max-width: 570px; -mru-width: 0px"><table role="presentation" class="vb-row" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 570px; -mru-width: 0px" width="570">\n' +
        '        \n' +
        '      <tr>\n' +
        '      <td align="center" valign="top" style="font-size: 0; padding: 0 9px; padding-top: 4px; padding-bottom: 4px; -ko-padding-top: @[blockSpacing.topPadding]px; -ko-padding-bottom: @[blockSpacing.bottomPadding]px;"><div style="vertical-align:top; width:100%; max-width: 552px; -mru-width: 0px"><!--\n' +
        '        --><table role="presentation" border="0" cellspacing="9" cellpadding="0" style="border-collapse: collapse; width: 100%" width="552">\n' +
        '          \n' +
        '        <tr><td class="long-text links-color" width="100%" valign="top" style="font-weight: normal; color: #919191; font-size: 13px; font-family: Arial, Helvetica, sans-serif; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px; text-align: center; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face" align="center" data-ko-editable="longText"><p>Email sent to <a href="mailto:' + tg('EMAIL') + '">' + tg('EMAIL') + '</a></p></td></tr>\n' +
        '        <tr><td width="100%" valign="top" style="font-weight: normal; color: #ffffff; font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align: center; -ko-font-size: @[linkStyle.size]px; -ko-color: @linkStyle.color; -ko-font-family: @linkStyle.face; padding: 9px; padding-top: 5px; padding-bottom: 5px; padding: 9px; padding-top: 5px; padding-bottom: 5px; -ko-padding: @[blockSpacing.horizontalSpacing]px; -ko-padding-top: @[blockSpacing.verticalSpacing]px; -ko-padding-bottom: @[blockSpacing.verticalSpacing]px;" align="center"><a style="color: #ffffff; -ko-color: @[Color.readability(linkStyle.color, backgroundColor) gt 2 ? linkStyle.color : (Color.isReadable(\'#ffffff\', backgroundColor) ? \'#ffffff\' : \'#000000\')]; text-decoration: underline; -ko-color: @linkStyle.color; -ko-text-decoration: @linkStyle.decoration" href="' + tg('LINK_UNSUBSCRIBE') + '" data-ko-editable="disiscrivitiText">Unsubscribe</a></td></tr>\n' +
        '      \n' +
        '        </table></div></td>\n' +
        '    </tr>\n' +
        '    \n' +
        '      </table></div><!--\n' +
        '    --><!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\n' +
        '  </td></tr>\n' +
        '    </table>\n' +
        '    <!-- /footerBlock -->\n' +
        '    \n' +
        '</center><!--[if !(gte mso 15)]--></body><!--<![endif]--></html>';

    return versafix;
}

function getMJMLSample(tagLanguage) {
    const tg = tag => renderTag(tagLanguage, tag);

    const mjmlSample = '<mjml>\n' +
        '  <mj-head>\n' +
        '    <mj-attributes>\n' +
        '      <mj-body background-color="white"/>\n' +
        '      <mj-section padding="0px 0px" />\n' +
        '      <mj-text padding="0px 10px" />\n' +
        '      <mj-image padding="10px 10px" alt="" />\n' +
        '      <mj-mosaico-image padding="10px 10px" alt="" />\n' +
        '      <mj-mosaico-button align="left" background-color="#e85034" color="#fff" border-radius="24px" font-size="11px" />\n' +
        '      \n' +
        '      <mj-class name="header-section" margin-top="10px" background-color="#e85034" padding-top="5px" padding-bottom="5px" full-width="full-width" css-class="header"/>\n' +
        '\n' +
        '      <mj-class name="banner-section" padding-top="10px" />\n' +
        '\n' +
        '      <mj-class name="feature-section" padding-top="10px" padding-bottom="15px" css-class="feature" />\n' +
        '      \n' +
        '      <mj-class name="divider-section" background-color="#e85034" vertical-align="middle" full-width="full-width" padding-top="10px" padding-bottom="5px" css-class="divider"/>\n' +
        '\n' +
        '      <mj-class name="article-section" padding-top="10px" padding-bottom="10px" css-class="article" />\n' +
        '\n' +
        '      <mj-class name="links-section" padding-top="0px" padding-bottom="0px" background-color="#e85034" vertical-align="middle" full-width="full-width" />\n' +
        '      <mj-social font-size="12px" font-family="arial,helvetica neue,helvetica,sans-serif" icon-size="30px" mode="horizontal" />\n' +
        '      <mj-social-element text-padding="4px 15px 4px 0px" padding="8px" alt="" color="white"/>\n' +
        '      \n' +
        '      <mj-class name="footer-section" padding-top="30px"/>\n' +
        '      <mj-class name="footer-text" css-class="footer" />\n' +
        '      \n' +
        '      <mj-class name="caption-text" css-class="caption" />\n' +
        '    </mj-attributes>\n' +
        '    \n' +
        '    <mj-mosaico-property property-id="leftImage" label="Left Image" type="image" />\n' +
        '    <mj-mosaico-property property-id="middleImage" label="Middle Image" type="image" />\n' +
        '    <mj-mosaico-property property-id="rightImage" label="Right Image" type="image" />\n' +
        '    <mj-mosaico-property property-id="readMoreLink" label="Button" type="link" />\n' +
        '\n' +
        '    <mj-mosaico-property property-id="captionVisible" label="Caption Visible" type="visible"/>\n' +
        '    \n' +
        '    <mj-style>\n' +
        '      p {\n' +
        '        font-family: Ubuntu, Helvetica, Arial, sans-serif, Helvetica, Arial, sans-serif;\n' +
        '        font-size: 12px;\n' +
        '        color: #9da3a3;\n' +
        '        margin-top: 8px;\n' +
        '      }\n' +
        '      \n' +
        '      h2 {\n' +
        '        margin: 5px 0px 0px 0px;\n' +
        '        font-size: 15px;\n' +
        '        font-weight: normal;\n' +
        '      }\n' +
        '      \n' +
        '      .header a {\n' +
        '        text-decoration: none;\n' +
        '        color: white;\n' +
        '      }\n' +
        '      \n' +
        '      .feature p {\n' +
        '        text-align: center;\n' +
        '      }\n' +
        '      \n' +
        '      .feature h2 {\n' +
        '        color: #e85034;\n' +
        '        text-align: center;\n' +
        '      }\n' +
        '      \n' +
        '      .divider h2 {\n' +
        '        color: white;\n' +
        '        text-align: center;\n' +
        '      }\n' +
        '      \n' +
        '      .divider p {\n' +
        '        color: #f8d5d1;\n' +
        '        text-align: center;\n' +
        '      }\n' +
        '\n' +
        '      .article h2 {\n' +
        '        font-weight: bold;\n' +
        '        margin-top: 10px;\n' +
        '      }\n' +
        '      \n' +
        '      .article p {\n' +
        '        color: #45474e;\n' +
        '      }\n' +
        '\n' +
        '      .footer a {\n' +
        '        color: #3A3A3A;\n' +
        '      }\n' +
        '\n' +
        '      .footer p {\n' +
        '        font-family: arial,helvetica neue,helvetica,sans-serif;\n' +
        '        font-size: 12px;\n' +
        '        text-align: center;\n' +
        '      }\n' +
        '      \n' +
        '      .caption p {\n' +
        '        font-size: 10px;\n' +
        '        text-align: center;\n' +
        '        margin-top: 0px;\n' +
        '      }\n' +
        '    </mj-style>\n' +
        '  </mj-head>\n' +
        '  \n' +
        '  <mj-body>\n' +
        '    \n' +
        '    <mj-section mj-class="header-section">\n' +
        '      <mj-column>\n' +
        '        <mj-text align="left"><a href="https://lists.example.org/subscription/' + tg('LIST_ID') + '?locale=en-US">Subscribe</a></mj-text>\n' +
        '      </mj-column>\n' +
        '      <mj-column>\n' +
        '        <mj-text align="right"><a href="' + tg('LINK_BROWSER') + '">View&nbsp;in&nbsp;browser</a></mj-text>\n' +
        '      </mj-column>\n' +
        '    </mj-section>\n' +
        '    \n' +
        '    <mj-mosaico-block block-id="banner" label="Banner">\n' +
        '      <mj-section mj-class="banner-section">\n' +
        '        <mj-column>\n' +
        '          <mj-mosaico-image property-id="image" placeholder-height="400" href="https://www.example.com/xxx" />\n' +
        '        </mj-column>\n' +
        '      </mj-section>\n' +
        '    </mj-mosaico-block>\n' +
        '\n' +
        '    <mj-mosaico-container>\n' +
        '      \n' +
        '      <mj-mosaico-block block-id="feature_section" label="Feature">\n' +
        '        <mj-section mj-class="feature-section">\n' +
        '          <mj-column>\n' +
        '            <mj-mosaico-image property-id="leftImage" placeholder-height="150" href-editable="true" />\n' +
        '            <mj-text>\n' +
        '              <h2 mj-mosaico-editable="leftTitleText">Lorem ipsum dolor</h2>\n' +
        '              <div mj-mosaico-editable="leftBodyText">\n' +
        '                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend sagittis nunc, et fermentum est ullamcorper dignissim.</p>\n' +
        '              </div>\n' +
        '            </mj-text>\n' +
        '          </mj-column>\n' +
        '          <mj-column>\n' +
        '            <mj-mosaico-image property-id="middleImage" placeholder-height="150" href-editable="true" />\n' +
        '            <mj-text>\n' +
        '              <h2 mj-mosaico-editable="middleTitleText">Lorem ipsum dolor</h2>\n' +
        '              <div mj-mosaico-editable="leftBodyText">\n' +
        '                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend sagittis nunc, et fermentum est ullamcorper dignissim.</p>\n' +
        '              </div>\n' +
        '            </mj-text>\n' +
        '          </mj-column>\n' +
        '          <mj-column>\n' +
        '            <mj-mosaico-image property-id="rightImage" placeholder-height="150" href-editable="true" />\n' +
        '            <mj-text>\n' +
        '              <h2 mj-mosaico-editable="rightTitleText">Lorem ipsum dolor</h2>\n' +
        '              <div mj-mosaico-editable="leftBodyText">\n' +
        '                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend sagittis nunc, et fermentum est ullamcorper dignissim.</p>\n' +
        '              </div>\n' +
        '            </mj-text>\n' +
        '          </mj-column>\n' +
        '        </mj-section>\n' +
        '      </mj-mosaico-block>\n' +
        '\n' +
        '      <mj-mosaico-block block-id="divider_section" label="Divider">\n' +
        '        <mj-section mj-class="divider-section">\n' +
        '          <mj-column>\n' +
        '            <mj-text>\n' +
        '              <h2 mj-mosaico-editable="titleText">Lorem ipsum dolor</h2>\n' +
        '            </mj-text>\n' +
        '            <mj-divider border-color="white" border-width="1px" padding-bottom="10px" padding-top="15px"></mj-divider>\n' +
        '            <mj-text>\n' +
        '              <div mj-mosaico-editable="bodyText">\n' +
        '                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>\n' +
        '              </div>\n' +
        '            </mj-text>\n' +
        '          </mj-column>\n' +
        '        </mj-section>\n' +
        '      </mj-mosaico-block>    \n' +
        '    \n' +
        '      <mj-mosaico-block block-id="article_section" label="Article">\n' +
        '        <mj-section mj-class="article-section">\n' +
        '          <mj-column>\n' +
        '            <mj-mosaico-image property-id="image" placeholder-height="280" href-editable="true" />\n' +
        '            <mj-mosaico-conditional-display property-id="captionVisible">\n' +
        '              <mj-text mj-class="caption-text">\n' +
        '                <div mj-mosaico-editable="captionText"></div>\n' +
        '              </mj-text>\n' +
        '            </mj-mosaico-conditional-display>\n' +
        '          </mj-column>\n' +
        '          <mj-column>\n' +
        '            <mj-text>\n' +
        '              <h2 mj-mosaico-editable="titleText">Lorem ipsum dolor</h2>\n' +
        '              <div mj-mosaico-editable="bodyText">\n' +
        '                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>\n' +
        '              </div>\n' +
        '            </mj-text>\n' +
        '            <mj-mosaico-button property-id="readMoreLink" font-family="Ubuntu, Helvetica, Arial, sans-serif, Helvetica, Arial, sans-serif" padding-left="10px" padding-bottom="15px" padding-top="15px">Read more ...</mj-mosaico-button>\n' +
        '          </mj-column>\n' +
        '        </mj-section>\n' +
        '      </mj-mosaico-block>  \n' +
        '\n' +
        '      <mj-mosaico-block block-id="text_section" label="Text">\n' +
        '        <mj-section>\n' +
        '          <mj-column>\n' +
        '            <mj-text>\n' +
        '              <div mj-mosaico-editable="text">\n' +
        '                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>\n' +
        '              </div>\n' +
        '            </mj-text>\n' +
        '          </mj-column>\n' +
        '        </mj-section>\n' +
        '      </mj-mosaico-block>\n' +
        '      \n' +
        '      <mj-mosaico-block block-id="image_section" label="Image">\n' +
        '        <mj-section>\n' +
        '          <mj-column>\n' +
        '            <mj-mosaico-image property-id="image" placeholder-height="400" href-editable="false" />\n' +
        '            <mj-mosaico-conditional-display property-id="captionVisible">\n' +
        '              <mj-text mj-class="caption-text">\n' +
        '                <div mj-mosaico-editable="captionText"></div>\n' +
        '              </mj-text>\n' +
        '            </mj-mosaico-conditional-display>\n' +
        '          </mj-column>\n' +
        '        </mj-section>\n' +
        '      </mj-mosaico-block>\n' +
        '      \n' +
        '      <mj-mosaico-block block-id="image_left_and_right_section" label="Image Left and Right">\n' +
        '        <mj-section>\n' +
        '          <mj-column>\n' +
        '            <mj-mosaico-image property-id="leftImage" placeholder-height="250" href-editable="false" />\n' +
        '            <mj-mosaico-conditional-display property-id="leftCaptionVisible" label="Left Caption Visible">\n' +
        '              <mj-text mj-class="caption-text">\n' +
        '                <div mj-mosaico-editable="leftCaptionText"></div>\n' +
        '              </mj-text>\n' +
        '            </mj-mosaico-conditional-display>\n' +
        '          </mj-column>\n' +
        '          <mj-column>\n' +
        '            <mj-mosaico-image property-id="rightImage" placeholder-height="250" href-editable="false" />\n' +
        '            <mj-mosaico-conditional-display property-id="rightCaptionVisible" label="Right Caption Visible">\n' +
        '              <mj-text mj-class="caption-text">\n' +
        '                <div mj-mosaico-editable="rightCaptionText"></div>\n' +
        '              </mj-text>\n' +
        '            </mj-mosaico-conditional-display>\n' +
        '          </mj-column>\n' +
        '        </mj-section>\n' +
        '      </mj-mosaico-block>\n' +
        '      \n' +
        '    </mj-mosaico-container>    \n' +
        '\n' +
        '    <mj-section mj-class="links-section">\n' +
        '      <mj-column>\n' +
        '        <mj-social border-radius="5px">\n' +
        '          <mj-social-element name="facebook" href="' + tg('LINK_BROWSER') + '">Share on Facebook</mj-social-element>\n' +
        '          <mj-social-element  name="twitter" href="' + tg('LINK_BROWSER') + '">Tweet</mj-social-element>\n' +
        '        </mj-social>       \n' +
        '      </mj-column>\n' +
        '    </mj-section>\n' +
        '    \n' +
        '    <mj-section mj-class="footer-section">\n' +
        '      <mj-column>\n' +
        '        <mj-text mj-class="footer-text">\n' +
        '          <p>This email was sent to <a href="mailto:' + tg('EMAIL') + '">' + tg('EMAIL') + '</a><p>\n' +
        '          <p> &nbsp; <a href="' + tg('LINK_UNSUBSCRIBE') + '">Unsubscribe&nbsp;from&nbsp;this&nbsp;list</a> &nbsp;  &nbsp; <a href="' + tg('LINK_PREFERENCES') + '">Update&nbsp;subscription&nbsp;preferences</a> &nbsp; </p>\n' +
        '          <p>Your address XXXXXX</p>\n' +
        '        </mj-text>\n' +
        '      </mj-column>\n' +
        '    </mj-section>\n' +
        '    \n' +
        '  </mj-body>\n' +
        '</mjml>';

    return mjmlSample;
}

module.exports = {
    getVersafix,
    getMJMLSample
};