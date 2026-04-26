module.exports ={
    "extends": "next/core-web-vitals",
    "rules": {
        "quotes": [
            "warn",
            "single"
        ],
        "jsx-quotes": [
            "warn",
            "prefer-single"
        ],
        "no-console": "warn",
        "prefer-const": "warn",
        "semi": [
            "warn",
            "never"
        ],
        "indent": [
            "warn",
            2
        ],
        "comma-dangle": [
            "warn",
            "never"
        ],
        "import/order": [
            "error",
            {
                "groups": [
                    "builtin",
                    "external",
                    "internal",
                    "parent",
                    "sibling",
                    "index",
                    "object",
                    "type"
                ]
            }
        ],
        "react-hooks/rules-of-hooks": "off",
        "react-hooks/exhaustive-deps": "off"
    }
}
