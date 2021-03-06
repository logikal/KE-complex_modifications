'use strict'

{
  let groups = []
  let fetchTotalNumber = 0
  let fetchCount = 0

  Vue.directive('scroll-to-hash', {
    componentUpdated (el) {
      if (groups.length > 0) {
        if (fetchTotalNumber > 0 && fetchTotalNumber == fetchCount) {
          const hash = window.location.hash
          if (hash) {
            window.location.href = '#'
            window.location.href = hash

            const id = hash.substring(1)
            $('#' + id + ' .collapse').collapse('show')
          }
        }
      }
    }
  })

  const baseName = (path) => {
    let base = path.substring(path.lastIndexOf('/') + 1)
    if (base.lastIndexOf(".") != -1) {
      base = base.substring(0, base.lastIndexOf("."))
    }
    return base
  }

  const mainContainer = new Vue({
    el: '#main-container',
    data: {
      groups: groups,
      baseName: baseName(window.location.pathname)
    },
    methods: {
      showDescription (id) {
        $('#' + id + ' .collapse').collapse('show')
      }
    }
  })

  const jsonUrl = (path) => {
    const url = encodeURIComponent(window.location.href.replace(/[^/]+$/, '') + path)
    return 'karabiner://karabiner/assets/complex_modifications/import?url=' + url
  }

  const fetchFile = (path, groupIndex, fileIndex) => {
    axios.get(path).then(function(response) {
      ++fetchCount

      let f = groups[groupIndex].files[fileIndex]
      if (f === undefined) {
        f = {}
      }
      f.id = baseName(path)
      f.title = response.data.title
      f.importUrl = jsonUrl(path)
      f.rules = []

      response.data.rules.forEach(function(r) {
        f.rules.push(r.description)
      })

      Vue.set(groups[groupIndex].files, fileIndex, f)
    }).catch(function(error) {
      console.log(error)
    })
  }

  const fetchExtraDescription = function(path, groupIndex, fileIndex) {
    axios.get(path).then(function(response) {
      ++fetchCount

      let f = groups[groupIndex].files[fileIndex]
      if (f === undefined) {
        f = {}
      }
      f.extraDescription = response.data

      Vue.set(groups[groupIndex].files, fileIndex, f)
    }).catch(function(error) {
      console.log(error)
    })
  }

  axios.get('groups.json')
    .then(function(response) {
      let type = baseName(window.location.pathname)
      if (type === '') {
        type = 'index'
      }

      response.data[type].forEach(function(group, groupIndex) {
        let g = {
          id: group.id,
          name: group.name,
          files: []
        }
        g.files.length = group.files.length
        g.files.fill(undefined)
        groups.push(g)

        group.files.forEach(function(file, fileIndex) {
          if (file.path) {
            ++fetchTotalNumber
            fetchFile(file.path, groupIndex, fileIndex)
          }
          if (file.extra_description_path) {
            ++fetchTotalNumber
            fetchExtraDescription(file.extra_description_path, groupIndex, fileIndex)
          }
        })
      })
    })
    .catch(function(error) {
      console.log(error)
    })
}
