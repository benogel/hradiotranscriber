module.exports = function(env) {
  console.log({env});
  return require(`./conf/webpack.${env}.js`)
}