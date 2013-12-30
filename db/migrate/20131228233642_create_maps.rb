class CreateMaps < ActiveRecord::Migration
  def change
    create_table :maps do |t|
      t.float :latitude
      t.float :longitude
      t.string :name
      t.string :formatted_address
      t.string :formatted_phone_number
      t.decimal :rating
      t.string :url
      t.string :website
      t.string :map_ref
      t.string :photos_url

      t.timestamps
    end
  end
end
