module.exports = {
    "rules": {
        "indent": [
            2,
            2
        ],
        "quotes": [
            2,
            "single"
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "semi": [
            2,
            "always"
        ],
        "func-names": 0,
        "space-before-function-paren": [2, "never"],
        "vars-on-top": 0,
    },

    "globals": {
      "Promise": true
    },

    "plugins": [
      "require-path-exists"
    ],

    "extends": "airbnb/legacy"
};
