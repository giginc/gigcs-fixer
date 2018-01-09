# GIG Coding Standard Fixer (gigcs-fixer)

## 必要環境

- PHP (CLI)
- Node.js

## セットアップ

### Step1. PHPとnode.jsをインストール

#### Mac OS

Homebrewを利用してインストールするのが一番早い

```
brew install php
brew install node
```

##### Windows

公式サイトからダウンロードし、インストールしてください。

PHP: <http://php.net/downloads.php>
Node.js: <https://nodejs.org/en/download/>

### Step2. gigcs-fixerをインストール

```
git clone git@github.com:giginc/gigcs-fixer.git
```

```
cd /path/to/gigcs-fixer
npm install
./bin/gigcs-fixer check
```

## 使い方

```
gigcs-fixer fix [php|css|html|js|front] [directory]
```

## その他

下記の整形ツール使用しています

- PHP: <https://github.com/FriendsOfPHP/PHP-CS-Fixer>
- HTML: <https://github.com/jonschlinkert/pretty>
- JS&CSS: <https://github.com/beautify-web/js-beautify>