import {
  ContentModel,
  ContentModelSchemaFieldEnum,
  ContentModelSchemaFieldObject,
  ContentModelSchemaTypes
} from '@wepublish/api'
import {typeMediaLibrary} from './modelMediaLibrary'

const title: ContentModelSchemaFieldObject = {
  type: ContentModelSchemaTypes.object,
  fields: {
    title: {
      type: ContentModelSchemaTypes.string
    },
    lead: {
      type: ContentModelSchemaTypes.string
    }
  }
}

const richText: ContentModelSchemaFieldObject = {
  type: ContentModelSchemaTypes.object,
  fields: {
    richText: {
      type: ContentModelSchemaTypes.richText
    }
  }
}

const image: ContentModelSchemaFieldObject = {
  type: ContentModelSchemaTypes.object,
  fields: {
    image: {
      type: ContentModelSchemaTypes.reference,
      types: {
        [typeMediaLibrary]: {
          scope: 'local'
        }
      }
    },
    caption: {
      type: ContentModelSchemaTypes.string
    }
  }
}

const imageGallery: ContentModelSchemaFieldObject = {
  type: ContentModelSchemaTypes.object,
  fields: {
    images: {
      type: ContentModelSchemaTypes.list,
      contentType: image
    }
  }
}

const blockListicleItem: ContentModelSchemaFieldObject = {
  type: ContentModelSchemaTypes.object,
  fields: {
    title: {
      type: ContentModelSchemaTypes.string
    },
    richText: {
      type: ContentModelSchemaTypes.richText
    },
    image: {
      type: ContentModelSchemaTypes.reference,
      types: {
        mediaLibrary: {
          scope: 'local'
        }
      }
    }
  }
}

const listicle: ContentModelSchemaFieldObject = {
  type: ContentModelSchemaTypes.object,
  fields: {
    items: {
      type: ContentModelSchemaTypes.list,
      contentType: {
        type: ContentModelSchemaTypes.object,
        fields: {
          id: {
            type: ContentModelSchemaTypes.id
          },
          value: blockListicleItem
        }
      }
    }
  }
}

const vimeo: ContentModelSchemaFieldObject = {
  type: ContentModelSchemaTypes.object,
  fields: {
    videoID: {
      type: ContentModelSchemaTypes.id
    }
  }
}

const youtube: ContentModelSchemaFieldObject = {
  type: ContentModelSchemaTypes.object,
  fields: {
    videoID: {
      type: ContentModelSchemaTypes.id
    }
  }
}

const soundCloudTrack: ContentModelSchemaFieldObject = {
  type: ContentModelSchemaTypes.object,
  fields: {
    trackID: {
      type: ContentModelSchemaTypes.id
    }
  }
}

const embed: ContentModelSchemaFieldObject = {
  type: ContentModelSchemaTypes.object,
  fields: {
    type: {
      type: ContentModelSchemaTypes.string,
      optional: true
    },
    url: {
      type: ContentModelSchemaTypes.string,
      optional: true
    },
    title: {
      type: ContentModelSchemaTypes.string,
      optional: true
    },
    width: {
      type: ContentModelSchemaTypes.int,
      optional: true
    },
    height: {
      type: ContentModelSchemaTypes.int,
      optional: true
    },
    styleCustom: {
      type: ContentModelSchemaTypes.string,
      optional: true
    }
  }
}

const linkPageBreak: ContentModelSchemaFieldObject = {
  type: ContentModelSchemaTypes.object,
  optional: true,
  fields: {
    text: {
      type: ContentModelSchemaTypes.string,
      optional: true
    },
    richText: {
      type: ContentModelSchemaTypes.richText
    },
    linkURL: {
      type: ContentModelSchemaTypes.string,
      optional: true
    },
    linkText: {
      type: ContentModelSchemaTypes.string,
      optional: true
    },
    linkTarget: {
      type: ContentModelSchemaTypes.string,
      optional: true
    },
    hideButton: {
      type: ContentModelSchemaTypes.boolean
    },
    styleOption: {
      type: ContentModelSchemaTypes.string,
      optional: true
    },
    layoutOption: {
      type: ContentModelSchemaTypes.string,
      optional: true
    },
    templateOption: {
      type: ContentModelSchemaTypes.string,
      optional: true
    },
    image: {
      type: ContentModelSchemaTypes.reference,
      optional: true,
      types: {
        [typeMediaLibrary]: {
          scope: 'local'
        }
      }
    }
  }
}

const quote: ContentModelSchemaFieldObject = {
  type: ContentModelSchemaTypes.object,
  fields: {
    quote: {
      type: ContentModelSchemaTypes.string
    },
    author: {
      type: ContentModelSchemaTypes.string
    }
  }
}

const teaserStyle: ContentModelSchemaFieldEnum = {
  type: ContentModelSchemaTypes.enum,
  values: [
    {description: 'default', value: 'DEFAULT'},
    {description: 'light', value: 'LIGHT'},
    {description: 'text', value: 'TEXT'}
  ]
}

const teaserGrid: ContentModelSchemaFieldObject = {
  type: ContentModelSchemaTypes.object,
  fields: {
    teasers: {
      type: ContentModelSchemaTypes.list,
      contentType: {
        type: ContentModelSchemaTypes.object,
        fields: {
          style: teaserStyle,
          imageID: {
            type: ContentModelSchemaTypes.reference,
            types: {
              [typeMediaLibrary]: {
                scope: 'local'
              }
            }
          },
          preTitle: {type: ContentModelSchemaTypes.string},
          title: {type: ContentModelSchemaTypes.string},
          lead: {type: ContentModelSchemaTypes.string},
          contentRef: {
            type: ContentModelSchemaTypes.reference,
            types: {
              article: {
                scope: 'all'
              }
            }
          }
        }
      }
    },
    numColumns: {
      type: ContentModelSchemaTypes.int
    }
  }
}

export const contentModelArticle: ContentModel = {
  identifier: 'article',
  nameSingular: 'Article',
  namePlural: 'Articles',
  schema: {
    content: {
      blocks: {
        type: ContentModelSchemaTypes.list,
        contentType: {
          type: ContentModelSchemaTypes.union,
          cases: {
            title,
            richText,
            image,
            imageGallery,
            listicle,
            vimeo,
            youtube,
            soundCloudTrack,
            embed,
            linkPageBreak,
            quote,
            teaserGrid
          }
        }
      }
    },
    meta: {
      title: {
        type: ContentModelSchemaTypes.string
      },
      preTitle: {
        type: ContentModelSchemaTypes.string
      },
      lead: {
        type: ContentModelSchemaTypes.string
      },
      seoTitle: {
        type: ContentModelSchemaTypes.string
      },
      slug: {
        type: ContentModelSchemaTypes.string
      },
      authors: {
        type: ContentModelSchemaTypes.list,
        contentType: {
          type: ContentModelSchemaTypes.reference,
          types: {
            author: {
              scope: 'local'
            }
          }
        }
      },
      hideAuthors: {
        type: ContentModelSchemaTypes.boolean
      },
      breaking: {
        type: ContentModelSchemaTypes.boolean
      },
      peering: {
        type: ContentModelSchemaTypes.boolean
      }
    }
  }
}
