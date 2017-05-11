module.exports = {
	env: {
		es6: true,
		node: true,
		"jest/globals": true,
	},
	extends: [
		"eslint:recommended",
		"plugin:jest/recommended",
	],
	plugins: [
		"jest",
	],
	rules: {
		"arrow-body-style": ["error", "as-needed", {
			requireReturnForObjectLiteral: true,
		}],
		"arrow-parens": ["error", "as-needed"],
		"arrow-spacing": "error",
		"comma-dangle": ["error", "always-multiline"],
		indent: ["error", "tab"],
		"keyword-spacing": "error",
		"linebreak-style": ["error","unix"],
		"no-trailing-spaces": "error",
		"no-useless-escape": "error",
		"quote-props": ["error", "as-needed"],
		quotes: ["error", "double"],
		semi: ["error", "never"],
		"space-before-blocks": ["error", {
			classes: "always",
			functions: "always",
			keywords: "always",
		}],
		"space-before-function-paren": ["error", "never"],
		"space-infix-ops": "error",
		"space-unary-ops": ["error", {
			nonwords: false,
			words: true,
		}],
	},
}
